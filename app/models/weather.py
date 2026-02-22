from typing import Optional, List
from pydantic import BaseModel, ConfigDict

class WeatherRequest(BaseModel):
    """
    Request model for weather queries.
    """
    location: str
    unit: str = "celsius"  # 'celsius' or 'fahrenheit'

class WeatherResponse(BaseModel):
    """
    Structured response model for weather data.
    """
    location: str
    temp_c: float
    condition: str
    humidity: int
    wind_kph: float
    local_time: Optional[str] = None
    
    model_config = ConfigDict(from_attributes=True)

class ForecastItem(BaseModel):
    dt_txt: str  # e.g. "2024-03-20 12:00:00"
    temp_c: float
    condition: str
    humidity: int
    rain_prob: float = 0.0

class ForecastResponse(BaseModel):
    location: str
    forecast: List[ForecastItem]

