import pytest
from unittest.mock import patch, AsyncMock
from app.models.weather import WeatherResponse, ForecastResponse
import uuid

@pytest.fixture
def mock_weather_client():
    with patch("app.agent.nodes.weather_client") as mock:
        mock.get_current_weather = AsyncMock()
        mock.get_forecast = AsyncMock()
        yield mock

def test_health_check(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}

def test_weather_endpoint_weather_query(client, mock_weather_client):
    user_id = str(uuid.uuid4())
    mock_weather_client.get_current_weather.return_value = WeatherResponse(
        location="Paris",
        temp_c=20.0,
        condition="Sunny",
        humidity=50,
        wind_kph=10.0
    )
    
    response = client.post("/weather", json={"query": "What is the weather in Paris?"}, params={"x_user_id": user_id})
    
    assert response.status_code == 200
    data = response.json()
    assert data["ok"] is True
    assert "Paris" in data["data"]["answer"]
    assert "20.0" in data["data"]["answer"]

def test_weather_endpoint_fallback(client):
    user_id = str(uuid.uuid4())
    response = client.post("/weather", json={"query": "Tell me a joke"}, params={"x_user_id": user_id})
    
    assert response.status_code == 200
    data = response.json()
    assert data["ok"] is True
    assert "only answer weather" in data["data"]["answer"]

def test_mcp_endpoint(client, mock_weather_client):
    # MCP might trigger weather tool or forecast depending on query. "Weather in Tokyo" -> Weather tool.
    mock_weather_client.get_current_weather.return_value = WeatherResponse(
        location="Tokyo",
        temp_c=25.0,
        condition="Rain",
        humidity=80,
        wind_kph=5.0
    )
    
    response = client.post("/mcp", json={"query": "Weather in Tokyo"})
    
    assert response.status_code == 200
    data = response.json()
    assert "answer" in data
    assert "Tokyo" in data["answer"]
    # Verify metadata existing if advanced MCP is active
    if "tools_used" in data:
         assert "weather_api" in data["tools_used"]
