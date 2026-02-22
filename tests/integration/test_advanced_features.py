import pytest
from unittest.mock import patch, AsyncMock
from app.models.weather import WeatherResponse, ForecastResponse, ForecastItem

@pytest.fixture
def mock_weather_client():
    with patch("app.agent.nodes.weather_client") as mock: # Patch the instance
        mock.get_current_weather = AsyncMock()
        mock.get_forecast = AsyncMock()
        yield mock

def test_umbrella_reasoning(client, mock_weather_client):
    # Mock raining weather
    mock_weather_client.get_current_weather.return_value = WeatherResponse(
        location="London",
        temp_c=10.0,
        condition="light rain",
        humidity=90,
        wind_kph=15.0
    )
    
    response = client.post("/weather", json={"query": "Do I need an umbrella in London?"})
    
    assert response.status_code == 200
    data = response.json()
    assert data["ok"] is True
    answer = data["data"]["answer"]
    
    assert "London" in answer
    assert "umbrella" in answer.lower() # Should recommend umbrella
    assert "raining" in answer.lower()

def test_forecast_query(client, mock_weather_client):
    # Mock forecast
    mock_weather_client.get_forecast.return_value = ForecastResponse(
        location="Paris",
        forecast=[
            ForecastItem(dt_txt="2024-03-22 12:00", temp_c=18.0, condition="Clear", humidity=50, rain_prob=0.0)
        ]
    )
    
    response = client.post("/weather", json={"query": "What is the forecast for Paris?"})
    
    assert response.status_code == 200
    data = response.json()
    assert "Paris" in data["data"]["answer"]
    assert "2024-03-22" in data["data"]["answer"]

def test_mcp_metadata(client, mock_weather_client):
    mock_weather_client.get_current_weather.return_value = WeatherResponse(
        location="Tokyo",
        temp_c=25.0,
        condition="Sunshine",
        humidity=40,
        wind_kph=5.0
    )
    
    response = client.post("/mcp", json={"query": "Weather in Tokyo"})
    
    assert response.status_code == 200
    data = response.json()
    
    assert "answer" in data
    assert "tools_used" in data
    assert "weather_api" in data["tools_used"]
    assert "confidence" in data
    assert "response_time_ms" in data
    assert data["response_time_ms"] >= 0
