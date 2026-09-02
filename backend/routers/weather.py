"""
routers/weather.py
GET /weather/{state} — Weather data for a state
"""

from fastapi import APIRouter
from backend.services.weather_service import WeatherService

router  = APIRouter()
weather_svc = WeatherService()

@router.get("/weather/{state}", summary="Get weather for a state")
def get_weather(state: str):
    """
    Returns weather condition and its impact on crop prices for the given state.

    *Conditions:* normal | deficit | excess
    *Impact:* how weather affects supply and prices
    """
    return weather_svc.get_weather(state)