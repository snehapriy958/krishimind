"""
backend/services/weather_service.py

Fetches weather data for Indian states.
- Primary  : calls OpenWeatherMap API (free tier)
- Fallback : realistic mock data per state (works without API key)
"""

import os
import requests
from datetime import datetime

STATE_CAPITALS = {
    "Maharashtra":    "Nashik",
    "Karnataka":      "Bangalore",
    "Uttar Pradesh":  "Lucknow",
    "Madhya Pradesh": "Indore",
    "Telangana":      "Hyderabad",
    "Punjab":         "Ludhiana",
    "Haryana":        "Karnal",
    "Rajasthan":      "Jaipur",
    "Gujarat":        "Ahmedabad",
    "Andhra Pradesh": "Guntur",
    "Tamil Nadu":     "Chennai",
    "West Bengal":    "Kolkata",
}


def _mock_weather(state: str) -> dict:
    month = datetime.now().month

    if month in [6, 7, 8, 9]:
        condition = "excess"
        desc      = "Heavy monsoon rainfall"
        impact    = "Crop damage possible - expect supply disruption and price spike"
        temp      = 28
        rain      = 85
    elif month in [3, 4, 5]:
        condition = "deficit"
        desc      = "Hot and dry conditions"
        impact    = "Heat stress on crops - moderate supply reduction expected"
        temp      = 38
        rain      = 5
    else:
        condition = "normal"
        desc      = "Cool and pleasant"
        impact    = "Normal weather - no disruption to supply expected"
        temp      = 22
        rain      = 20

    state_mod = {
        "Tamil Nadu":  {"condition": "excess",  "impact": "Northeast monsoon active - heavy rainfall"},
        "Rajasthan":   {"condition": "deficit",  "impact": "Arid conditions - water stress on crops"},
        "West Bengal": {"condition": "excess",  "impact": "High humidity - fungal disease risk for crops"},
        "Punjab":      {"condition": "normal",   "impact": "Good rabi conditions - wheat crop healthy"},
    }
    if state in state_mod and month not in [6, 7, 8, 9]:
        condition = state_mod[state]["condition"]
        impact    = state_mod[state]["impact"]

    return {
        "state":         state,
        "city":          STATE_CAPITALS.get(state, state),
        "condition":     condition,
        "description":   desc,
        "temperature_c": temp,
        "rainfall_mm":   rain,
        "impact":        impact,
        "source":        "IMD Mock (add OPENWEATHER_API_KEY to .env for live data)",
    }


class WeatherService:
    """
    With OPENWEATHER_API_KEY in .env → real live data
    Without API key → realistic mock (works perfectly for demo)
    """

    def __init__(self):
        # FIXED: was os.getenv("5796d64...", "") — hardcoded key as variable name
        self.api_key = os.getenv("OPENWEATHER_API_KEY", "")

    def get_weather(self, state: str) -> dict:
        if self.api_key:
            try:
                return self._fetch_live(state)
            except Exception as e:
                print(f"⚠️ OpenWeather API error: {e} — using mock")
        return _mock_weather(state)

    def _fetch_live(self, state: str) -> dict:
        city = STATE_CAPITALS.get(state, state)
        url  = "https://api.openweathermap.org/data/2.5/weather"
        params = {
            "q":     f"{city},IN",
            "appid": self.api_key,
            "units": "metric",
        }
        r    = requests.get(url, params=params, timeout=5)
        r.raise_for_status()
        data = r.json()

        temp    = data["main"]["temp"]
        rain_1h = data.get("rain", {}).get("1h", 0)
        desc    = data["weather"][0]["description"].capitalize()

        if rain_1h > 5 or "heavy rain" in desc.lower():
            condition = "excess"
            impact    = "Heavy rainfall — crop damage and supply disruption likely"
        elif temp > 38:
            condition = "deficit"
            impact    = "Extreme heat — crop stress reducing supply"
        else:
            condition = "normal"
            impact    = "Normal weather — no major supply disruption expected"

        return {
            "state":         state,
            "city":          city,
            "condition":     condition,
            "description":   desc,
            "temperature_c": round(temp, 1),
            "rainfall_mm":   round(rain_1h, 1),
            "impact":        impact,
            "source":        "OpenWeatherMap (live)",
        }