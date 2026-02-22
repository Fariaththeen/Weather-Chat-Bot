import asyncio
import os
from dotenv import load_dotenv
from app.services.weather_client import WeatherClient

# Load env variables from .env file if present
load_dotenv()

async def main():
    print("Testing WeatherClient...")
    
    # Check for API key
    api_key = os.getenv("WEATHER_API_KEY")
    if not api_key:
        print("WARNING: WEATHER_API_KEY not found in environment. Please set it in .env or export it.")
        print("Example: export WEATHER_API_KEY='your_key'")
        return

    client = WeatherClient()
    
    cities = ["London", "New York", "Tokyo", "InvalidCityNameXYZ"]
    
    for city in cities:
        print(f"\nFetching weather for: {city}")
        try:
            weather = await client.get_current_weather(city)
            print(f"Success! {weather}")
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(main())
