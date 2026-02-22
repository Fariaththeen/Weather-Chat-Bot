from typing import Dict, Any, List
from datetime import datetime, timedelta
import structlog
from pydantic import BaseModel, Field
from langchain_groq import ChatGroq
from app.agent.state import AgentState
from app.services.weather_client import WeatherClient
from app.models.weather import WeatherResponse, ForecastResponse
from app.utils.errors import WeatherAssistantError

logger = structlog.get_logger()
weather_client = WeatherClient()

class QueryExtraction(BaseModel):
    location: str = Field(description="The city name mentioned in the query. Fix any typos. Return empty string if no location is mentioned at all.")
    intent: str = Field(description="One of: 'current_weather', 'forecast', 'other'. If they ask about tomorrow or next week, it is 'forecast'.")
    activity: str = Field(description="The specific activity implied by the query (e.g., 'outdoor_exercise', 'umbrella_check'), or empty string if none.")

def router_node(state: AgentState) -> AgentState:
    """
    Uses Gemini to extract intent, activity, and location from the query directly.
    Replaces the manual regex parsing.
    """
    query = state["query"]
    context = state.get("context", {}) or {}
    
    # Reset ephemeral context for the new turn
    if "activity" in context:
        del context["activity"]
    if "reasoning" in context:
        del context["reasoning"]

    # Call Llama 3 for structured extraction
    llm = ChatGroq(model="llama-3.1-8b-instant", temperature=0).with_structured_output(QueryExtraction)
    
    current_date = datetime.now().strftime("%Y-%m-%d")
    last_loc = context.get("last_location", "")
    prompt = f"User Query: '{query}'\nPreviously known location: '{last_loc}'.\nToday's date is: {current_date}.\nExtract the location, intent, and any activity (like needing an umbrella, or going for a run)."
    
    try:
        extraction = llm.invoke(prompt)
        
        # Decide final location
        final_location = extraction.location.strip()
        if not final_location and last_loc:
            final_location = last_loc
            
        # Update context
        if extraction.activity:
            context["activity"] = extraction.activity
        if final_location:
            context["last_location"] = final_location
            
        # Decide next node based on intent
        next_node = "weather_tool"
        if extraction.intent == "forecast":
            next_node = "forecast_tool"
        elif extraction.intent == "other":
             next_node = "fallback"
             
        logger.info("llama_routing", extraction=dict(extraction), next=next_node)
             
        return {
            "location": final_location,
            "context": context,
            "next_node": next_node,
            "error": None
        }
    except Exception as e:
        logger.error("refiner_error", error=str(e))
        return {"error": f"Failed to understand query: {str(e)}", "next_node": "error_handler"}


async def weather_tool_node(state: AgentState) -> AgentState:
    context = state.get("context", {})
    location = state.get("location") or context.get("last_location")
    
    if not location:
        return {"error": "Could not extract location.", "next_node": "error_handler"}
    
    try:
        weather = await weather_client.get_current_weather(location)
        return {
            "weather_data": weather.model_dump(),
            "location": location,
            "context": context,
            "error": None
        }
    except Exception as e:
        logger.error("weather_tool_error", error=str(e))
        return {"error": str(e), "next_node": "error_handler"}

async def forecast_tool_node(state: AgentState) -> AgentState:
    context = state.get("context", {})
    location = state.get("location") or context.get("last_location")
    
    if not location:
        return {"error": "Could not extract location.", "next_node": "error_handler"}
        
    try:
        forecast = await weather_client.get_forecast(location)
        
        return {
            "weather_data": forecast.model_dump(),
            "location": location,
            "context": context,
            "error": None
        }
    except Exception as e:
        return {"error": str(e), "next_node": "error_handler"}

def reasoning_node(state: AgentState) -> AgentState:
    """
    Passthrough. We moved reasoning into the LLM formatter directly.
    """
    return {"next_node": "formatter"}

def formatter_node(state: AgentState) -> AgentState:
    data = state.get("weather_data")
    query = state["query"]
    
    if not data:
        return {"final_response": "I don't have weather data to answer that."}
        
    llm = ChatGroq(model="llama-3.1-8b-instant", temperature=0.3)
    
    # Prune data slightly so we don't blow up context unnecessarily if it's huge, 
    # though 5 days of 3-hour chunks is perfectly fine for 1M tokens.
    import json
    data_str = json.dumps(data)
    
    current_date = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    prompt = f"""
You are a helpful and very concise weather assistant. The user asked: "{query}"

Today's current date and time is: {current_date}. 
Use this to understand relative day requests like "tomorrow" or "day after tomorrow".

Here is the raw weather data:
{data_str}

Answer the user's specific question naturally using this data. 
If they ask for a specific day, look for the timestamps that match that specific day in the data and report on those. 
Do NOT output a list or raw JSON or say "based on the data". Write a smooth, human-readable paragraph. Keep it brief. 
If they asked about activities (running, umbrellas, etc.), give a clear recommendation based on the weather.
    """
    
    try:
        response = llm.invoke(prompt)
        return {"final_response": response.content.strip()}
    except Exception as e:
        logger.error("formatter_error", error=str(e))
        return {"final_response": "I have the data but encountered an error generating the text."}

def fallback_node(state: AgentState) -> AgentState:
    return {"final_response": "I can only answer weather questions."}

def error_handler_node(state: AgentState) -> AgentState:
    error = state.get("error", "Unknown")
    return {"final_response": f"Error: {error}"}
