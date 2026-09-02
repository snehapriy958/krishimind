"""
KrishiMind Backend — main.py

Run from the project root:

    python -m uvicorn backend.main:app --host 127.0.0.1 --port 8002

Development mode:

    python -m uvicorn backend.main:app --reload --host 127.0.0.1 --port 8002
"""

import os
import sys


# ==================================================
# ENSURE PROJECT ROOT IS IN PYTHON PATH
# ==================================================

BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.dirname(BACKEND_DIR)

if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

print(f"main.py ROOT_DIR = {ROOT_DIR}")


# ==================================================
# IMPORTS
# ==================================================

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from backend.routers import predict, weather, news


# ==================================================
# CUSTOM UTF-8 JSON RESPONSE
# ==================================================

class UTF8JSONResponse(JSONResponse):
    media_type = "application/json; charset=utf-8"


# ==================================================
# APP INITIALIZATION
# ==================================================

app = FastAPI(
    title="KrishiMind API",
    description="""
KrishiMind — AI Mandi Price Prediction API

Endpoints:

- POST /predict
- GET /weather/{state}
- GET /news/{crop}
- GET /health
""",
    version="1.0.0",
    default_response_class=UTF8JSONResponse,
)


# ==================================================
# CORS
# ==================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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
        "app": "KrishiMind API",
        "version": "1.0.0",
        "docs": "/docs",
        "endpoints": {
            "predict": "POST /predict",
            "weather": "GET /weather/{state}",
            "news": "GET /news/{crop}",
            "health": "GET /health",
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

    from ml.predict_prices import MODELS

    return {
        "status": "healthy",
        "models_loaded": list(MODELS.keys()),
        "total_models": len(MODELS),
    }
