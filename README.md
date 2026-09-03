# KrishiMind

### AI-Powered Crop Price Prediction and Agricultural Market Intelligence Platform

KrishiMind is an end-to-end AI-powered agricultural intelligence platform that helps users analyze crop market prices and forecast future mandi prices using **LSTM-based deep learning models**.

The platform combines time-series forecasting with agricultural market intelligence, including market price analysis, forecast confidence, mandi comparison, weather context, and crop-related news sentiment.

---

## Live Demo

🌐 **Frontend:** https://krishimind-seven.vercel.app

🔗 **Backend API:** https://krishimind-api.onrender.com

📚 **API Documentation:** https://krishimind-api.onrender.com/docs

---

# Problem Statement

Agricultural commodity prices can fluctuate significantly because of factors such as:

- Market supply and arrivals
- Seasonal demand
- Weather conditions
- Storage availability
- Regional mandi variations
- Agricultural news and market sentiment

Farmers and agricultural stakeholders often lack a single platform that combines historical market behavior with AI-based price forecasting and market context.

KrishiMind addresses this problem by providing crop-level price predictions and agricultural market intelligence through an interactive web platform.

---

# Solution

KrishiMind uses trained **Long Short-Term Memory (LSTM)** models to forecast future crop mandi prices.

The prediction pipeline provides:

1. Current market price
2. Future predicted price
3. Daily forecast values
4. Forecast confidence
5. Prediction error metrics
6. Price trend analysis
7. Advisory action
8. Mandi comparison
9. Weather context
10. Agricultural news sentiment

The application transforms machine learning predictions into an interactive dashboard designed to make agricultural market forecasts easier to understand.

---

# Key Features

## AI Crop Price Prediction

- LSTM-based time-series forecasting
- Crop-specific trained models
- Configurable prediction horizon
- Multi-day forecast generation
- Current vs predicted price comparison

## Supported Crops

KrishiMind currently supports:

- Onion
- Tomato
- Potato
- Wheat
- Rice

## Forecast Analytics

Each prediction provides:

- Current mandi price
- Predicted future price
- Percentage price change
- Forecast trend
- Daily forecast values
- Upper prediction range
- Lower prediction range
- Model confidence
- MAPE
- MAE
- RMSE

## Agricultural Intelligence

The platform also provides contextual agricultural signals such as:

- Market supply and arrivals
- Weather conditions and impact
- Agricultural news sentiment
- Crop-specific market signals
- Mandi comparisons

## Mandi Comparison

Users can compare predicted crop prices across multiple mandis to understand regional market differences.

## AI Advisory

Based on predicted market movement and available market context, KrishiMind generates action-oriented recommendations such as:

- WAIT
- HOLD
- SELL

## Prediction History

The dashboard stores generated predictions and displays information including:

- Crop
- Mandi
- Prediction date
- Forecast horizon
- Predicted price
- Current status
- Accuracy
- Recommended action

## Interactive Dashboard

The frontend includes:

- Crop selection
- Prediction history
- Price trend charts
- Current vs predicted price comparison
- Confidence visualization
- Mandi comparison charts
- Market signals
- News sentiment
- AI advisory

---

# How KrishiMind Works

```text
                    Historical Crop Price Data
                              │
                              ▼
                    Data Preprocessing
                              │
                              ▼
                    Feature Engineering
                              │
                              ▼
                   Crop-Specific LSTM Model
                              │
                              ▼
                      Price Forecast
                              │
             ┌────────────────┼────────────────┐
             ▼                ▼                ▼
       Daily Forecast    Error Metrics    Trend Analysis
             │                │                │
             └────────────────┼────────────────┘
                              ▼
                    Prediction API Response
                              │
               ┌──────────────┼──────────────┐
               ▼              ▼              ▼
        Weather Context   News Sentiment   Market Signals
               │              │              │
               └──────────────┼──────────────┘
                              ▼
                     KrishiMind Dashboard
```

---

# System Architecture

```text
┌─────────────────────────────────────┐
│          React Frontend             │
│                                     │
│  Dashboard │ Charts │ Predictions   │
│  Market Signals │ AI Advisory       │
└──────────────────┬──────────────────┘
                   │
                   │ REST API
                   ▼
┌─────────────────────────────────────┐
│          FastAPI Backend            │
│                                     │
│  Prediction Router                  │
│  Weather Service                    │
│  News Sentiment Service             │
│  Advisory Logic                     │
└──────────────────┬──────────────────┘
                   │
                   ▼
┌─────────────────────────────────────┐
│           ML Layer                  │
│                                     │
│  Crop-Specific LSTM Models          │
│                                     │
│  Onion                              │
│  Tomato                             │
│  Potato                             │
│  Rice                               │
│  Wheat                              │
└─────────────────────────────────────┘
```

---

# Machine Learning Model

KrishiMind uses **Long Short-Term Memory (LSTM)** neural networks for crop price forecasting.

LSTM networks are suitable for time-series forecasting because historical price observations can influence future market prices.

Separate trained models are used for different crops.

The prediction pipeline provides:

- Current price
- Predicted price
- Daily forecast
- Forecast trend
- Confidence range
- MAPE
- MAE
- RMSE

Weather conditions and agricultural news sentiment are presented as contextual market intelligence signals alongside the model forecast.

---

# Model Evaluation

The final KrishiMind evaluation was performed using 30 evaluation samples per crop.

| Crop | MAE | RMSE | MAPE |
|---|---:|---:|---:|
| Onion | 76.88 | 88.00 | 3.70% |
| Tomato | 124.19 | 144.79 | 6.71% |
| Potato | 312.80 | 345.42 | 20.92% |
| Rice | 180.73 | 202.99 | 4.55% |
| Wheat | 95.86 | 108.93 | 3.89% |

> Model performance varies across crops because each commodity has different levels of market volatility and price variation.

---

# Technology Stack

## Machine Learning

- Python
- TensorFlow
- Keras
- LSTM
- Scikit-learn
- Pandas
- NumPy

## Backend

- Python
- FastAPI
- Pydantic
- REST APIs
- Uvicorn

## Frontend

- React
- JavaScript
- Vite
- CSS
- Data visualization charts

## Deployment

- GitHub
- Render
- Vercel

---

# Project Structure

```text
krishimind/
│
├── backend/
│   │
│   ├── routers/
│   │   ├── predict.py
│   │   ├── news.py
│   │   └── weather.py
│   │
│   ├── services/
│   │   ├── lstm_service.py
│   │   ├── news_service.py
│   │   └── weather_service.py
│   │
│   ├── main.py
│   └── requirements.txt
│
├── frontend/
│   │
│   ├── public/
│   │
│   ├── src/
│   │   ├── components/
│   │   │   ├── charts/
│   │   │   ├── prediction/
│   │   │   └── common/
│   │   │
│   │   ├── data/
│   │   ├── tabs/
│   │   └── utils/
│   │
│   ├── package.json
│   └── vite.config.js
│
├── data/
│
├── ml/
│
├── models/
│
├── .env.example
├── .gitignore
└── README.md
```

---

# Local Setup

## 1. Clone the Repository

```bash
git clone https://github.com/snehapriy958/krishimind.git
cd krishimind
```

---

# Backend Setup

## 2. Create a Virtual Environment

### Windows

```bash
python -m venv venv
venv\Scripts\activate
```

## 3. Install Dependencies

```bash
pip install -r backend/requirements.txt
```

## 4. Configure Environment Variables

Create a `.env` file inside the backend directory.

Example:

```env
NEWS_API_KEY=your_news_api_key
OPENWEATHER_API_KEY=your_openweather_api_key
GROQ_API_KEY=your_groq_api_key
```

## 5. Run the Backend

```bash
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8002
```

For development with automatic reload:

```bash
python -m uvicorn backend.main:app --reload --host 127.0.0.1 --port 8002
```

The backend will be available at:

```text
http://127.0.0.1:8002
```

API documentation:

```text
http://127.0.0.1:8002/docs
```

---

# Frontend Setup

## 1. Navigate to the Frontend Directory

```bash
cd frontend
```

## 2. Install Dependencies

```bash
npm install
```

## 3. Configure Environment Variables

Create a `.env` file:

```env
VITE_API_URL=http://127.0.0.1:8002
```

## 4. Start the Development Server

```bash
npm run dev
```

The frontend will be available at:

```text
http://localhost:5173
```

---

# API Overview

KrishiMind exposes REST API endpoints for agricultural intelligence.

| Endpoint | Method | Description |
|---|---|---|
| `/` | GET | API status and information |
| `/health` | GET | Backend health check |
| `/predict` | POST | Generate crop price prediction |
| `/weather/{state}` | GET | Retrieve weather context |
| `/news/{crop}` | GET | Retrieve crop-related news sentiment |

Interactive API documentation is available at:

https://krishimind-api.onrender.com/docs

---

# Prediction Pipeline

```text
User selects crop and market
            │
            ▼
Frontend sends prediction request
            │
            ▼
FastAPI validates request
            │
            ▼
Crop-specific LSTM model processes data
            │
            ▼
Future price forecast generated
            │
            ├── Daily forecast
            ├── Confidence range
            ├── MAPE
            └── Trend analysis
            │
            ▼
Weather context retrieved
            │
            ▼
News sentiment retrieved
            │
            ▼
Market advisory generated
            │
            ▼
Interactive dashboard visualization
```

---

# Deployment

## Frontend

The KrishiMind frontend is deployed on Vercel.

**Live Application:**  
https://krishimind-seven.vercel.app

## Backend

The FastAPI backend is deployed on Render.

**Backend API:**  
https://krishimind-api.onrender.com

**Health Check:**  
https://krishimind-api.onrender.com/health

**API Documentation:**  
https://krishimind-api.onrender.com/docs

---

# Current Capabilities

- [x] Multi-crop price forecasting
- [x] Five supported crops
- [x] LSTM-based predictions
- [x] Multi-day forecasts
- [x] FastAPI backend
- [x] React dashboard
- [x] Prediction history
- [x] Price trend visualization
- [x] Forecast confidence
- [x] MAPE, MAE and RMSE metrics
- [x] Mandi comparison
- [x] Weather context
- [x] Agricultural news sentiment
- [x] Market signals
- [x] AI-based advisory
- [x] Vercel frontend deployment
- [x] Render backend deployment
- [x] End-to-end frontend and backend integration

---

# Future Improvements

Potential future improvements include:

- Real-time mandi price ingestion
- Automated model retraining pipelines
- Additional supported crops
- District-level price forecasting
- Weather features directly integrated into model training
- News sentiment directly integrated into model training
- Persistent user accounts
- Cloud-based prediction history
- Price alerts and notifications
- Mobile application support
- Improved model explainability

---

# Key Engineering Highlights

KrishiMind demonstrates a complete end-to-end AI application pipeline:

```text
Historical Data
      │
      ▼
Data Preprocessing
      │
      ▼
Deep Learning Model
      │
      ▼
Model Evaluation
      │
      ▼
FastAPI Backend
      │
      ▼
React Frontend
      │
      ▼
Cloud Deployment
```

The project focuses not only on building machine learning models but also on integrating and deploying them as a usable full-stack AI application.

---

# Author

**Sneha Singh**

AI/ML Engineer

---

# License

This project is intended for educational, research, and portfolio purposes.
