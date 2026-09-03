# KrishiMind

### AI-Powered Crop Price Prediction and Agricultural Market Intelligence Platform

KrishiMind is an end-to-end AI-powered agricultural intelligence platform that helps users analyze crop market prices and forecast future mandi prices using **LSTM-based deep learning models**.

The platform combines time-series forecasting with agricultural market intelligence, including market price analysis, forecast confidence, mandi comparison, weather context, and crop-related news sentiment.

---

## Live Demo

🌐 **Frontend:** https://krishimind-seven.vercel.app

> The frontend is deployed on Vercel and communicates with the KrishiMind prediction API.

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

The application transforms raw machine learning output into an interactive dashboard designed to make price forecasts easier to understand.

---

# Key Features

## AI Crop Price Prediction

- LSTM-based time-series forecasting
- Crop-specific trained models
- Configurable prediction horizon
- Daily forecast generation
- Current vs predicted price comparison

## Supported Crops

KrishiMind currently supports:

- 🧅 Onion
- 🍅 Tomato
- 🥔 Potato
- 🌾 Wheat
- 🌾 Rice

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

The platform also displays contextual agricultural signals such as:

- Market supply and arrivals
- Weather conditions and impact
- Agricultural news sentiment
- Crop-specific market signals
- Mandi comparisons

## Mandi Comparison

Users can compare predicted crop prices across multiple mandis to understand regional market differences.

## AI Advisory

Based on the predicted market movement, KrishiMind generates an action-oriented advisory such as:

- WAIT
- HOLD
- SELL

## Prediction History

The dashboard tracks generated predictions and displays:

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
- Current vs predicted comparison
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
