import pytest
import respx
from httpx import Response
from app.services.weather_client import WeatherClient, ForecastResponse

@pytest.fixture
def client_with_cache():
    return WeatherClient(api_key="test_key")

@pytest.mark.asyncio
async def test_get_forecast_parsing(client_with_cache):
    with respx.mock(base_url="https://api.openweathermap.org/data/2.5") as respx_mock:
        respx_mock.get("/forecast").mock(return_value=Response(200, json={
            "city": {"name": "London"},
            "list": [
                {
                    "dt_txt": "2024-03-20 12:00:00",
                    "main": {"temp": 15.0, "humidity": 60},
                    "weather": [{"description": "rain"}],
                    "pop": 0.8  # 80% rain probability
                },
                {
                    "dt_txt": "2024-03-20 15:00:00",
                    "main": {"temp": 16.0, "humidity": 55},
                    "weather": [{"description": "cloudy"}],
                    "pop": 0.1
                }
            ]
        }))
        
        forecast = await client_with_cache.get_forecast("London")
        
        assert isinstance(forecast, ForecastResponse)
        assert forecast.location == "London"
        assert len(forecast.forecast) == 2
        assert forecast.forecast[0].rain_prob == 0.8
        assert forecast.forecast[0].condition == "rain"

@pytest.mark.asyncio
async def test_caching(client_with_cache):
    with respx.mock(base_url="https://api.openweathermap.org/data/2.5") as respx_mock:
        route = respx_mock.get("/weather").mock(return_value=Response(200, json={
            "name": "London",
            "main": {"temp": 10},
            "weather": [{"description": "clear"}],
            "wind": {"speed": 5}
        }))
        
        # First call hits API
        await client_with_cache.get_current_weather("London")
        assert route.call_count == 1
        
        # Second call hits cache
        await client_with_cache.get_current_weather("London")
        assert route.call_count == 1  # Still 1
