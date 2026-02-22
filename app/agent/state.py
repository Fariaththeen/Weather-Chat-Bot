from typing import TypedDict, Optional, Dict, Any, List, Annotated
from langgraph.graph.message import add_messages

class AgentState(TypedDict):
    """
    State of the weather agent loop.
    Now includes conversation history and context.
    """
    messages: Annotated[List[Any], add_messages]
    query: str
    location: Optional[str]
    weather_data: Optional[Dict[str, Any]]
    final_response: Optional[str]
    error: Optional[str]
    next_node: Optional[str]
    context: Dict[str, Any] # Persistent context (e.g. user preferences, last city)
