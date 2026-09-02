"""
services/news_service.py

Fetches crop news and runs sentiment analysis.

Priority order:
1. NewsAPI → DistilBERT (transformers) for sentiment
2. NewsAPI → Claude API for sentiment (if transformers not installed)
3. Full mock (headlines + pre-scored sentiment) — works with zero API keys
"""

import os
import json
import requests

# ─── Mock headlines per crop ──────────────────────────────────────────────────
MOCK_HEADLINES = {
    "onion": [
        "Government bans onion exports amid rising domestic prices",
        "Heavy rainfall damages onion crop in Nashik belt",
        "Maharashtra farmers demand better MSP for onion",
        "Onion prices likely to stay elevated for next 2 weeks",
    ],
    "tomato": [
        "Tomato prices surge to ₹100/kg in retail markets amid supply crunch",
        "Andhra Pradesh tomato harvest delayed by unseasonal rain",
        "Cold chain expansion expected to reduce tomato price volatility",
        "Tomato arrivals at mandis down 30% from last week",
    ],
    "potato": [
        "Agra cold storage potato stocks adequate for next quarter",
        "Potato prices dip 15% as UP harvest enters market",
        "Processing demand from chips industry to support potato prices",
        "Bumper potato crop in Punjab keeps prices stable",
    ],
    "wheat": [
        "Government increases wheat MSP by 7% for upcoming season",
        "Record wheat procurement by FCI boosts farmer confidence",
        "Punjab wheat harvest expected above normal this rabi",
        "Wheat prices stable as government buffer stocks adequate",
    ],
    "rice": [
        "India rice export restrictions continue impacting domestic supply",
        "Kharif paddy output estimated at 106 MT above target",
        "Rice millers report good margins amid stable procurement",
        "Monsoon rains support paddy transplanting in major states",
    ],
}

# ─── Pre-scored mock sentiment (used when no API keys available) ──────────────
MOCK_SENTIMENT = {
    "onion":  {"sentiment": -0.35, "label": "bearish",  "reason": "Export ban and rainfall damage dampening price outlook"},
    "tomato": {"sentiment":  0.42, "label": "bullish",  "reason": "Severe supply crunch due to rain damage pushing prices up"},
    "potato": {"sentiment": -0.18, "label": "bearish",  "reason": "Adequate cold storage stocks creating supply pressure"},
    "wheat":  {"sentiment":  0.28, "label": "bullish",  "reason": "Higher MSP and strong government procurement supporting prices"},
    "rice":   {"sentiment": -0.08, "label": "neutral",  "reason": "Export restrictions balanced against good domestic harvest"},
}


class NewsService:
    """
    Fetches news headlines and scores them for crop price sentiment.

    With NEWS_API_KEY → fetches real headlines
    With ANTHROPIC_API_KEY → uses Claude for smart sentiment
    With neither → uses mock headlines + pre-scored sentiment
    """

    def __init__(self):
        self.news_api_key    = os.getenv("NEWS_API_KEY", "")
        self.anthropic_key   = os.getenv("ANTHROPIC_API_KEY", "")
        self.use_distilbert = os.getenv(
            "USE_DISTILBERT",
            "false"
        ).lower() == "true"

        if self.use_distilbert:
            self.use_distilbert = self._try_load_distilbert()

    def _try_load_distilbert(self) -> bool:
        """Try to load DistilBERT sentiment pipeline."""
        try:
            from transformers import pipeline
            print("DistilBERT sentiment pipeline loading...")
            self._distilbert = pipeline(
                "sentiment-analysis",
                model="distilbert-base-uncased-finetuned-sst-2-english",
                truncation=True,
                max_length=512,
            )
            print("DistilBERT loaded successfully")
            return True
        except Exception as e:
            print(f" DistilBERT not available ({e}) — will use Claude API or mock")
            return False

    # ──────────────────────────────────────────────────────────────────────────
    # PUBLIC METHOD
    # ──────────────────────────────────────────────────────────────────────────

    def get_sentiment(self, crop: str) -> dict:
        """
        Main method. Returns:
        {
            crop:      str,
            sentiment: float  (-1.0 to 1.0),
            label:     str    (bullish / bearish / neutral),
            reason:    str,
            headlines: list[str],
            source:    str,
        }
        """
        # Step 1: Get headlines
        headlines = self._fetch_headlines(crop)

        # Step 2: Score sentiment
        if self.use_distilbert:
            result = self._score_distilbert(crop, headlines)
            source = "NewsAPI + DistilBERT"
        elif self.anthropic_key:
            result = self._score_claude(crop, headlines)
            source = "NewsAPI + Claude AI"
        else:
            result = MOCK_SENTIMENT.get(crop, {"sentiment": 0.0, "label": "neutral", "reason": "No model available"})
            source = "Mock sentiment (pre-scored)"

        return {
            "crop":      crop,
            "sentiment": result["sentiment"],
            "label":     result["label"],
            "reason":    result["reason"],
            "headlines": headlines[:3],
            "source":    source,
        }

    # ──────────────────────────────────────────────────────────────────────────
    # HEADLINE FETCHING
    # ──────────────────────────────────────────────────────────────────────────

    def _fetch_headlines(self, crop: str) -> list:
        """Fetch headlines from NewsAPI, fall back to mock."""
        if not self.news_api_key:
            return MOCK_HEADLINES.get(crop, ["No news available"])

        try:
            crop_name = {"onion":"onion","tomato":"tomato","potato":"potato","wheat":"wheat","rice":"rice"}.get(crop, crop)
            url    = "https://newsapi.org/v2/everything"
            params = {
                "q":        f"{crop_name} mandi India price",
                "language": "en",
                "sortBy":   "publishedAt",
                "pageSize": 5,
                "apiKey":   self.news_api_key,
            }
            r = requests.get(url, params=params, timeout=5)
            r.raise_for_status()
            articles  = r.json().get("articles", [])
            headlines = [a["title"] for a in articles if a.get("title")]
            return headlines if headlines else MOCK_HEADLINES.get(crop, [])
        except Exception as e:
            print(f"NewsAPI error: {e} — using mock headlines")
            return MOCK_HEADLINES.get(crop, [])

    # ──────────────────────────────────────────────────────────────────────────
    # DISTILBERT SENTIMENT (primary ML method)
    # ──────────────────────────────────────────────────────────────────────────

    def _score_distilbert(self, crop: str, headlines: list) -> dict:
        """
        Runs each headline through DistilBERT.
        Aggregates scores → maps to crop price sentiment.

        DistilBERT returns POSITIVE/NEGATIVE for general text.
        For crop prices: POSITIVE news = bullish, NEGATIVE news = bearish.
        But we invert some signals (e.g. "bumper harvest" is POSITIVE text but BEARISH for prices).
        """
        if not headlines:
            return {"sentiment": 0.0, "label": "neutral", "reason": "No headlines"}

        scores = []
        for headline in headlines[:4]:  # max 4 headlines
            try:
                result = self._distilbert(headline)[0]
                # DistilBERT: POSITIVE = 1.0, NEGATIVE = -1.0
                raw_score = result["score"] if result["label"] == "POSITIVE" else -result["score"]

                # Invert for supply-side signals (good harvest = bearish prices)
                supply_keywords = ["bumper", "record harvest", "good harvest", "adequate stocks",
                                   "arrivals increase", "surplus", "procurement target met"]
                if any(kw in headline.lower() for kw in supply_keywords):
                    raw_score = -abs(raw_score) * 0.6  # flip: good supply = lower prices

                scores.append(raw_score)
            except Exception:
                continue

        if not scores:
            return MOCK_SENTIMENT.get("onion")  # safe default

        avg_score = sum(scores) / len(scores)
        # Normalize to -1 to 1 range
        normalized = max(-1.0, min(1.0, avg_score * 0.8))

        if normalized > 0.15:
            label  = "bullish"
            reason = "News signals suggest positive price momentum"
        elif normalized < -0.15:
            label  = "bearish"
            reason = "News signals suggest downward price pressure"
        else:
            label  = "neutral"
            reason = "Mixed or neutral news signals"

        return {
            "sentiment": round(normalized, 3),
            "label":     label,
            "reason":    reason,
        }

    # ──────────────────────────────────────────────────────────────────────────
    # CLAUDE SENTIMENT (secondary — if DistilBERT not installed)
    # ──────────────────────────────────────────────────────────────────────────

    def _score_claude(self, crop: str, headlines: list) -> dict:
        """
        Uses Claude API for sentiment when DistilBERT is not available.
        Sends headlines, gets structured JSON back.
        """
        try:
            import anthropic
            client = anthropic.Anthropic(api_key=self.anthropic_key)
            prompt = f"""You are an agricultural market analyst for India.
Analyze these news headlines about {crop} and their impact on mandi prices.

Headlines:
{json.dumps(headlines, indent=2)}

Return ONLY this JSON (no other text):
{{
  "sentiment": <float from -1.0 to 1.0>,
  "label": "<bullish or bearish or neutral>",
  "reason": "<one sentence explanation>"
}}"""

            response = client.messages.create(
                model="claude-sonnet-4-20250514",
                max_tokens=150,
                messages=[{"role": "user", "content": prompt}]
            )
            return json.loads(response.content[0].text)
        except Exception as e:
            print(f"Claude API error: {e}")
            return MOCK_SENTIMENT.get(crop, {"sentiment": 0.0, "label": "neutral", "reason": "API error"})