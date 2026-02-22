import json
from typing import Dict, Any, List, Literal
from pydantic import BaseModel, Field
from langchain_groq import ChatGroq
from langchain_core.tools import tool
from langchain_core.messages import AIMessage, HumanMessage, SystemMessage, ToolMessage
from langgraph.graph import StateGraph, END
from langgraph.checkpoint.memory import MemorySaver
from langgraph.prebuilt import ToolNode, tools_condition

from dotenv import load_dotenv
load_dotenv()

from app.agent.state import AgentState
from app.services.weather_client import WeatherClient
from app.utils.errors import WeatherAssistantError
from app.agent.mcp_client import mcp_tools
import structlog

logger = structlog.get_logger()
weather_client = WeatherClient()

# --- 1. Define Tools ---

@tool
async def get_current_weather(location: str) -> Dict[str, Any]:
    """Get the current weather for a specific location. Use this when the user asks for the weather right now."""
    try:
        weather = await weather_client.get_current_weather(location)
        return weather.model_dump()
    except Exception as e:
        return {"error": str(e)}

@tool
async def get_forecast(location: str) -> Dict[str, Any]:
    """Get the 5-day weather forecast for a specific location. Use this when the user asks about the future (tomorrow, next week, etc.)."""
    try:
        forecast = await weather_client.get_forecast(location)
        return forecast.model_dump()
    except Exception as e:
        return {"error": str(e)}

# We will create the tool_node later dynamically, or inject tools
# But for now, we wrap a lambda that lazily returns the combined tools
def get_all_tools():
    return [get_current_weather, get_forecast] + mcp_tools

# The ToolNode needs to evaluate tools dynamically at runtime
# Because mcp_tools is populated asynchronously AFTER graph compilation.
async def tool_node(state: AgentState):
    node = ToolNode(get_all_tools())
    return await node.ainvoke(state)

# --- 2. Define Nodes ---

def agent_node(state: AgentState) -> AgentState:
    """
    The main LLM node. It decides whether to call a tool or respond directly.
    """
    query = state["query"]
    messages = state.get("messages", [])
    
    # Use Llama 3 via Groq, bind tools natively
    llm = ChatGroq(model="llama-3.1-8b-instant", temperature=0)
    
    # Combine static and dynamic MCP tools
    all_tools = get_all_tools()
    llm_with_tools = llm.bind_tools(all_tools)
    
    # Prune old ToolMessages to save context window.
    # agent_node doesn't need to read massive JSONs from previous turns.
    pruned_messages = []
    for msg in messages:
        if isinstance(msg, ToolMessage):
            pruned_messages.append(ToolMessage(content="[Data retrieved previously]", tool_call_id=msg.tool_call_id, name=msg.name))
        else:
            pruned_messages.append(msg)
            
    sys_msg = SystemMessage(content="You are a helpful weather assistant with a long term memory. Use tools to look up weather data when asked. If the user shares personal facts or preferences, immediately save them to your Knowledge Graph memory using your tools. If the user asks what you remember, read the graph. Keep responses conversational but brief.")
    
    try:
        response = llm_with_tools.invoke([sys_msg] + pruned_messages[-15:])
        
        # We append the AI's response (which may just be a tool_call) to the messages
        return {"messages": [response]}
        
    except Exception as e:
        logger.error("agent_node_error", error=str(e))
        return {"error": str(e), "messages": [AIMessage(content="I encountered an error trying to process your request.")]}

def formatter_node(state: AgentState) -> AgentState:
    """
    If the agent made a tool call and we executed it, the graph routes back here to generate the final human-readable answer.
    """
    messages = state.get("messages", [])
    
    # Extract the last few messages to give context to the formatter
    # We want it to see the user's query and the LAST raw ToolMessage output, but not OLD ToolMessages.
    pruned_messages = []
    for i, msg in enumerate(messages):
        if isinstance(msg, ToolMessage) and i != len(messages) - 1:
            pruned_messages.append(ToolMessage(content="[Data retrieved previously]", tool_call_id=msg.tool_call_id, name=msg.name))
        else:
            pruned_messages.append(msg)
            
    llm = ChatGroq(model="llama-3.1-8b-instant", temperature=0.3)
    
    sys_msg = SystemMessage(content="You are a helpful and concise weather assistant. The user asked a question, and a tool fetched the raw weather JSON data. Provide a completely natural, human-readable paragraph summarizing the conditions. Do NOT regurgitate the hourly data points, do NOT use bullet points, and do NOT say 'based on the data'. Since the user is already seeing a visual graph of the data, just give a 1-2 sentence high-level summary. ONLY give recommendations (like bringing an umbrella or wearing sunscreen) if the user explicitly asks for advice. Be extremely brief.")
    
    try:
        response = llm.invoke([sys_msg] + pruned_messages[-15:])
        # Store as final response so the SSE stream picks it up
        return {"final_response": response.content.strip(), "messages": [response]}
    except Exception as e:
        logger.error("formatter_error", error=str(e))
        return {"final_response": "I fetched the data but encountered an error generating the text."}

# --- 3. Build Graph ---

workflow = StateGraph(AgentState)

workflow.add_node("agent", agent_node)
workflow.add_node("tools", tool_node)
workflow.add_node("formatter", formatter_node)

workflow.set_entry_point("agent")

# Native routing: if agent output has tool_calls -> 'tools', else -> END
workflow.add_conditional_edges(
    "agent",
    tools_condition,
    {
        "tools": "tools",
        END: END
    }
)

# After tools run, always go to formatter to generate a nice sentence
workflow.add_edge("tools", "formatter")
workflow.add_edge("formatter", END)

memory = MemorySaver()
agent_graph = workflow.compile(checkpointer=memory)
