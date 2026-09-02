"""
KrishiMind Backend API

Run locally from project root:

    python -m uvicorn backend.main:app --host 127.0.0.1 --port 8002

Development:

    python -m uvicorn backend.main:app --reload --host 127.0.0.1 --port 8002
"""

import os
import sys

from dotenv import load_dotenv

load_dotenv()
from contextlib import asynccontextmanager


# ==================================================
# PROJECT PATH
# ==================================================

BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.dirname(BACKEND_DIR)

if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)


# ==================================================
# IMPORTS
# ==================================================

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from backend.routers import predict, weather, news


# ==================================================
# UTF-8 JSON RESPONSE
# ==================================================

class UTF8JSONResponse(JSONResponse):
    media_type = "application/json; charset=utf-8"


# ==================================================
# APPLICATION LIFESPAN
# ==================================================

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application startup/shutdown lifecycle.

    Kept lightweight so deployment health checks do not
    fail because of optional model-loading issues.
    """

    print("KrishiMind API starting...")

    yield

    print("KrishiMind API shutting down...")


# ==================================================
# FASTAPI APPLICATION
# ==================================================

app = FastAPI(
    title="KrishiMind API",
    description="""
KrishiMind — AI-powered Agricultural Mandi Price Prediction API.

Features:
- LSTM-based crop price forecasting
- Multi-day forecasts
- Confidence intervals
- Market sentiment context
- Weather impact context
- Farmer selling advisory
""",
    version="1.0.0",
    default_response_class=UTF8JSONResponse,
    lifespan=lifespan,
)


# ==================================================
# CORS
# ==================================================
#
# For deployment, allow all origins temporarily.
#
# Later, after frontend deployment, replace "*"
# with your exact frontend domain.
#
# ==================================================
# CORS
# ==================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:4173",
        "http://127.0.0.1:4173",
    ],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==================================================
# ROUTERS
# ==================================================

app.include_router(
    predict.router,
    tags=["Prediction"],
)

app.include_router(
    weather.router,
    tags=["Weather"],
)

app.include_router(
    news.router,
    tags=["News & Sentiment"],
)


# ==================================================
# ROOT
# ==================================================

@app.get(
    "/",
    tags=["Root"],
)
def root():

    return {
        "status": "online",
        "app": "KrishiMind API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health",
        "endpoints": {
            "predict": "POST /predict",
            "weather": "GET /weather/{state}",
            "news": "GET /news/{crop}",
        },
    }


# ==================================================
# HEALTH CHECK
# ==================================================

@app.get(
    "/health",
    tags=["Root"],
)
def health():
    """
    Lightweight deployment health check.

    Does not force model loading.
    This prevents the hosting platform from marking the
    service unhealthy because an ML model is still loading.
    """

    return {
        "status": "healthy",
        "service": "KrishiMind API",
        "version": "1.0.0",
    }