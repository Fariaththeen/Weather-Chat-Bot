class WeatherAssistantError(Exception):
    """Base exception for Weather Assistant"""
    pass

class InvalidLocationError(WeatherAssistantError):
    """Raised when the location cannot be found"""
    pass

class APIError(WeatherAssistantError):
    """Raised when the external API fails (timeout, 5xx)"""
    pass

class RateLimitError(WeatherAssistantError):
    """Raised when API rate limit is exceeded"""
    pass

class ConfigurationError(WeatherAssistantError):
    """Raised when configuration (e.g., API key) is missing"""
    pass
