import pytest
import respx
from httpx import Response
from app.services.weather_client import WeatherClient
from app.utils.errors import InvalidLocationError, APIError

@pytest.mark.asyncio
async def test_get_current_weather_success():
    client = WeatherClient(api_key="test_key")
    
    with respx.mock(base_url="https://api.openweathermap.org/data/2.5") as respx_mock:
        respx_mock.get("/weather").mock(return_value=Response(200, json={
            "name": "London",
            "main": {"temp": 15.0, "humidity": 60},
            "weather": [{"description": "cloudy"}],
            "wind": {"speed": 5.0} # m/s
        }))
        
        weather = await client.get_current_weather("London")
        
        assert weather.location == "London"
        assert weather.temp_c == 15.0
        assert weather.condition == "Cloudy"
        assert weather.wind_kph == 18.0 # 5.0 * 3.6

@pytest.mark.asyncio
async def test_get_current_weather_not_found():
    client = WeatherClient(api_key="test_key")
    
    with respx.mock(base_url="https://api.openweathermap.org/data/2.5") as respx_mock:
        respx_mock.get("/weather").mock(return_value=Response(404))
        
        with pytest.raises(InvalidLocationError):
            await client.get_current_weather("NonExistentCity")
