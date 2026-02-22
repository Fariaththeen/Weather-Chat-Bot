import httpx
import os
import structlog
import time
from typing import Dict, Any, Optional, Tuple, List
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type

from app.models.weather import WeatherResponse, ForecastResponse, ForecastItem
from app.utils.errors import (
    InvalidLocationError,
    APIError,
    RateLimitError,
    ConfigurationError,
)

logger = structlog.get_logger()

# Retry configuration
RETRY_CONFIG = {
    "stop": stop_after_attempt(3),
    "wait": wait_exponential(multiplier=1, min=2, max=10),
    "retry": retry_if_exception_type((httpx.TimeoutException, httpx.RequestError, RateLimitError, APIError)),
    "reraise": True
}

class WeatherClient:
    def __init__(self, api_key: Optional[str] = None, base_url: Optional[str] = None):
        self.api_key = api_key or os.getenv("WEATHER_API_KEY")
        self.base_url = base_url or os.getenv(
            "WEATHER_API_BASE_URL", "https://api.openweathermap.org/data/2.5"
        )
        
        # Simple in-memory cache: {key: (timestamp, data)}
        self._cache: Dict[str, Tuple[float, Any]] = {}
        self._cache_ttl = 300  # 5 minutes

        if not self.api_key:
            logger.warning("WEATHER_API_KEY not set. Client will fail calls.")

    def _get_from_cache(self, key: str) -> Optional[Any]:
        if key in self._cache:
            timestamp, data = self._cache[key]
            if time.time() - timestamp < self._cache_ttl:
                logger.debug("cache_hit", key=key)
                return data
            else:
                del self._cache[key]
        return None

    def _set_cache(self, key: str, data: Any):
        self._cache[key] = (time.time(), data)

    @retry(**RETRY_CONFIG)
    async def _make_request(self, endpoint: str, params: Dict[str, Any]) -> Dict[str, Any]:
        url = f"{self.base_url}/{endpoint}"
        async with httpx.AsyncClient(timeout=10.0) as client:
            logger.info("calling_weather_api", url=url)
            response = await client.get(url, params=params)
            
            if response.status_code == 404:
                raise InvalidLocationError("Location not found.")
            elif response.status_code == 401:
                raise ConfigurationError("Invalid API Key.")
            elif response.status_code == 429:
                raise RateLimitError("Weather API rate limit exceeded.")
            elif response.status_code >= 500:
                raise APIError(f"Weather API server error: {response.status_code}")
            
            response.raise_for_status()
            return response.json()

    async def get_lat_lon(self, query: str) -> Optional[Tuple[float, float, str]]:
        """
        Geocodes a query (e.g. "Paris", "Paris, TX") to (lat, lon, name).
        """
        key = f"geo:{query.lower()}"
        cached = self._get_from_cache(key)
        if cached:
            return cached

        if not self.api_key:
             raise ConfigurationError("WEATHER_API_KEY is not set.")

        # Direct Geocoding API: http://api.openweathermap.org/geo/1.0/direct?q={city name},{state code},{country code}&limit={limit}&appid={API key}
        url = "http://api.openweathermap.org/geo/1.0/direct"
        params = {
            "q": query,
            "limit": 1,
            "appid": self.api_key
        }
        
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                logger.info("calling_geo_api", url=url, query=query)
                response = await client.get(url, params=params)
                response.raise_for_status()
                data = response.json()
                
                if not data:
                    return None
                
                # Take first result
                first = data[0]
                lat = first.get("lat")
                lon = first.get("lon")
                name = first.get("name")
                country = first.get("country", "")
                full_name = f"{name}, {country}" if country else name
                
                result = (lat, lon, full_name)
                self._set_cache(key, result)
                return result
                
        except Exception as e:
            logger.error("geocoding_failed", error=str(e))
            return None

    async def get_current_weather(self, location: str) -> WeatherResponse:
        # Step 1: Geocode
        geo = await self.get_lat_lon(location)
        if geo:
             lat, lon, name = geo
             # Use coords for better accuracy
             return await self._get_weather_by_coords(lat, lon, name)

        # Fallback to old name-based lookup if geo fails (though API is deprecated for names)
        key = f"weather:{location.lower()}"
        cached = self._get_from_cache(key)
        if cached:
            return cached

        if not self.api_key:
             raise ConfigurationError("WEATHER_API_KEY is not set.")

        params = {
            "q": location,
            "appid": self.api_key,
            "units": "metric",
        }

        try:
            data = await self._make_request("weather", params)
            result = self._parse_current(data)
            self._set_cache(key, result)
            return result
        except httpx.ConnectError:
             raise APIError("Could not connect to weather service.")
        except Exception as e:
            if isinstance(e, (InvalidLocationError, ConfigurationError)):
                raise
            logger.error("weather_fetch_failed", error=str(e))
            raise APIError(f"Failed to fetch weather: {str(e)}")

    async def _get_weather_by_coords(self, lat: float, lon: float, name: str) -> WeatherResponse:
        key = f"weather:{lat},{lon}"
        cached = self._get_from_cache(key)
        if cached:
            return cached

        params = {
            "lat": lat,
            "lon": lon,
            "appid": self.api_key,
            "units": "metric",
        }
        
        try:
            data = await self._make_request("weather", params)
            # Override name with geocoded name for clarity
            data["name"] = name 
            result = self._parse_current(data)
            self._set_cache(key, result)
            return result
        except Exception as e:
             raise APIError(f"Failed to fetch weather by coords: {str(e)}")

    async def get_forecast(self, location: str) -> ForecastResponse:
        # Step 1: Geocode
        geo = await self.get_lat_lon(location)
        if geo:
             lat, lon, name = geo
             return await self._get_forecast_by_coords(lat, lon, name)

        # Fallback (old way)
        key = f"forecast:{location.lower()}"
        cached = self._get_from_cache(key)
        if cached:
             return cached

        if not self.api_key:
             raise ConfigurationError("WEATHER_API_KEY is not set.")

        params = {
            "q": location,
            "appid": self.api_key,
            "units": "metric",
        }
        
        try:
            data = await self._make_request("forecast", params)
            result = self._parse_forecast(data)
            self._set_cache(key, result)
            return result
        except Exception as e:
             if isinstance(e, (InvalidLocationError, ConfigurationError)):
                raise
             logger.error("forecast_fetch_failed", error=str(e))
             raise APIError(f"Failed to fetch forecast: {str(e)}")

    async def _get_forecast_by_coords(self, lat: float, lon: float, name: str) -> ForecastResponse:
        key = f"forecast:{lat},{lon}"
        cached = self._get_from_cache(key)
        if cached:
             return cached

        params = {
            "lat": lat,
            "lon": lon,
            "appid": self.api_key,
            "units": "metric",
        }
        
        try:
            data = await self._make_request("forecast", params)
            # Override city name
            if "city" in data:
                data["city"]["name"] = name
            result = self._parse_forecast(data)
            self._set_cache(key, result)
            return result
        except Exception as e:
             raise APIError(f"Failed to fetch forecast by coords: {str(e)}")

    def _parse_current(self, data: Dict[str, Any]) -> WeatherResponse:
        try:
            main = data.get("main", {})
            weather = data.get("weather", [{}])[0]
            wind = data.get("wind", {})
            
            return WeatherResponse(
                location=data.get("name", "Unknown"),
                temp_c=main.get("temp", 0.0),
                condition=weather.get("description", "Unknown").capitalize(),
                humidity=main.get("humidity", 0),
                wind_kph=wind.get("speed", 0.0) * 3.6,
            )
        except Exception as e:
            raise APIError(f"Failed to parse weather data: {str(e)}")

    def _parse_forecast(self, data: Dict[str, Any]) -> ForecastResponse:
        try:
            city_name = data.get("city", {}).get("name", "Unknown")
            raw_list = data.get("list", [])
            items = []
            
            for item in raw_list:
                main = item.get("main", {})
                weather = item.get("weather", [{}])[0]
                
                # Probability of precipitation
                pop = item.get("pop", 0.0)
                
                items.append(ForecastItem(
                    dt_txt=item.get("dt_txt", ""),
                    temp_c=main.get("temp", 0.0),
                    condition=weather.get("description", "Unknown"),
                    humidity=main.get("humidity", 0),
                    rain_prob=float(pop)
                ))
            
            return ForecastResponse(location=city_name, forecast=items)
        except Exception as e:
            raise APIError(f"Failed to parse forecast data: {str(e)}")
