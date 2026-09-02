"""
routers/news.py
GET /news/{crop} — News sentiment for a crop
"""

from fastapi import APIRouter
from backend.services.news_service import NewsService

router   = APIRouter()
news_svc = NewsService()

@router.get("/news/{crop}", summary="Get news sentiment for a crop")
def get_news(crop: str):
    """
    Fetches recent headlines for the crop and runs DistilBERT sentiment analysis.

    *Returns:*
    - sentiment score: -1.0 (very bearish) to +1.0 (very bullish)
    - label: bullish / bearish / neutral
    - reason: one-line explanation
    - headlines: list of recent news headlines used
    """
    crop = crop.lower()
    return news_svc.get_sentiment(crop)