from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse, StreamingResponse
from pydantic import BaseModel
from typing import Dict, Any, Optional
import structlog
import uuid
import time
import json
import asyncio
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

from langchain_core.messages import HumanMessage
from app.agent.graph import agent_graph
from app.agent.state import AgentState
from app.agent.mcp_client import mcp_server_lifespan

logger = structlog.get_logger()

app = FastAPI(title="Agentic Weather Assistant", lifespan=mcp_server_lifespan)

class WeatherQuery(BaseModel):
    query: str

class APIResponse(BaseModel):
    ok: bool
    data: Optional[Dict[str, Any]] = None
    error: Optional[str] = None

@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    request_id = str(uuid.uuid4())
    structlog.contextvars.bind_contextvars(request_id=request_id)
    response = await call_next(request)
    return response

@app.get("/health")
async def health_check():
    return {"status": "ok"}

@app.get("/")
async def root():
    return {"message": "Agentic Weather Assistant is running. Visit /docs for API documentation."}

@app.post("/weather", response_model=APIResponse)
async def query_weather(request: WeatherQuery, x_user_id: str = "web_user"):
    """
    Standard API endpoint for checking weather.
    """
    try:
        logger.info("received_query", query=request.query, user_id=x_user_id)
        
        # Invoke the LangGraph agent
        # Use ainvoke for async execution
        config = {"configurable": {"thread_id": x_user_id}}
        initial_state = {"query": request.query, "messages": [HumanMessage(content=request.query)]}
        result = await agent_graph.ainvoke(initial_state, config=config)
        
        final_answer = result.get("final_response")
        
        # If no final response (shouldn't happen with our graph logic),
        # check if there was an error in state
        if not final_answer:
            error = result.get("error", "Unknown agent error")
            return JSONResponse(
                status_code=500,
                content={"ok": False, "error": error}
            )

        return {"ok": True, "data": {"answer": final_answer, "details": result.get("weather_data")}}

    except Exception as e:
        logger.exception("api_error")
        return JSONResponse(
            status_code=500,
            content={"ok": False, "error": str(e)}
        )

@app.post("/chat/stream")
async def chat_stream(request: WeatherQuery, x_user_id: str = "web_user"):
    """
    Streaming endpoint that returns server-sent events (SSE).
    """
    async def event_generator():
        config = {"configurable": {"thread_id": x_user_id}}
        initial_state = {"query": request.query, "messages": [HumanMessage(content=request.query)]}
        
        try:
            async for event in agent_graph.astream_events(initial_state, config=config, version="v2"):
                kind = event["event"]
                
                # Stream node transitions
                if kind == "on_chat_model_stream":
                    # We can stream tokens directly from the agent if needed, but for now 
                    # we wait for the final formatter response.
                    pass
                
                elif kind == "on_tool_start":
                    tool_name = event["name"]
                    yield f"data: {json.dumps({'type': 'tool_start', 'tool': tool_name})}\n\n"
                    
                elif kind == "on_tool_end":
                    tool_name = event["name"]
                    data = event["data"].get("output")
                    # data here is a ToolMessage object
                    if data:
                        try:
                            # The @tool function returns a dict, but ToolMessage.content might be a stringified dict
                            content = data.content
                            if isinstance(content, str):
                                content = json.loads(content)
                            yield f"data: {json.dumps({'type': 'weather_data', 'data': content})}\n\n"
                        except Exception as e:
                            logger.error("tool_parse_error", error=str(e), content=data.content)
                        
                elif kind == "on_chain_end":
                    node_name = event["name"]
                    data = event["data"].get("output")
                    
                    if node_name == "formatter" and data and isinstance(data, dict) and "final_response" in data:
                        # Output from the dedicated formatter node
                        yield f"data: {json.dumps({'type': 'final_response', 'content': data['final_response']})}\n\n"
                        
                    elif node_name == "agent" and data and isinstance(data, dict) and "messages" in data:
                        # If the agent responded directly (no tools)
                        last_msg = data["messages"][-1]
                        if not last_msg.tool_calls and last_msg.content:
                            yield f"data: {json.dumps({'type': 'final_response', 'content': last_msg.content})}\n\n"

            yield "data: [DONE]\n\n"

        except Exception as e:
            logger.error("stream_error", error=str(e))
            yield f"data: {json.dumps({'type': 'error', 'content': str(e)})}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")

@app.post("/mcp")
async def mcp_handler(request: WeatherQuery):
    """
    Advanced MCP endpoint with metadata.
    """
    start_time = time.time()
    try:
        # Use a config with thread_id for memory
        config = {"configurable": {"thread_id": "mcp_default"}}
        
        initial_state = {"query": request.query, "messages": [HumanMessage(content=request.query)]}
        result = await agent_graph.ainvoke(initial_state, config=config)
        
        final_answer = result.get("final_response")
        if not final_answer:
             return {"error": result.get("error", "Processing failed")}
        
        # Metadata extraction
        tools_used = []
        if result.get("weather_data"):
            if "forecast" in result["weather_data"]:
                tools_used.append("forecast_api")
            else:
                tools_used.append("weather_api")
        
        duration_ms = int((time.time() - start_time) * 1000)
        
        return {
            "answer": final_answer,
            "tools_used": tools_used,
            "confidence": 0.95, # Placeholder
            "response_time_ms": duration_ms
        }
        
    except Exception as e:
        logger.exception("mcp_error")
        return {"error": str(e)}
