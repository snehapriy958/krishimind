"""
KrishiMind Prediction API

Prediction pipeline:

    Crop-level LSTM forecast
            |
            v
    Optional news sentiment context
            |
            v
    Optional weather context
            |
            v
    Final API response

Weather and sentiment are contextual signals.

They do not modify the trained LSTM prediction because
they were not used as input features during model training.
"""

from typing import List, Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field, field_validator

from backend.services.lstm_service import LSTMService
from backend.services.news_service import NewsService
from backend.services.weather_service import WeatherService


# ==================================================
# ROUTER
# ==================================================

router = APIRouter()


# ==================================================
# SERVICES
# ==================================================

lstm_svc = LSTMService()
news_svc = NewsService()
weather_svc = WeatherService()


# ==================================================
# VALID VALUES
# ==================================================

VALID_CROPS = {
    "onion",
    "tomato",
    "potato",
    "wheat",
    "rice",
}


VALID_STATES = {
    "maharashtra": "Maharashtra",
    "karnataka": "Karnataka",
    "uttar pradesh": "Uttar Pradesh",
    "madhya pradesh": "Madhya Pradesh",
    "telangana": "Telangana",
    "punjab": "Punjab",
    "haryana": "Haryana",
    "rajasthan": "Rajasthan",
    "gujarat": "Gujarat",
    "andhra pradesh": "Andhra Pradesh",
    "tamil nadu": "Tamil Nadu",
    "west bengal": "West Bengal",
}


# ==================================================
# CONSTANTS
# ==================================================

HINDI_SUMMARY = (
    "मंडी भाव का अनुमान मॉडल द्वारा किया गया है।"
)


# ==================================================
# REQUEST MODEL
# ==================================================

class PredictRequest(BaseModel):

    crop: str = Field(
        ...,
        examples=["onion"],
    )

    market: str = Field(
        ...,
        examples=["Nashik APMC"],
    )

    state: str = Field(
        ...,
        examples=["Maharashtra"],
    )

    district: str = Field(
        ...,
        examples=["Nashik"],
    )

    days_ahead: int = Field(
        ...,
        ge=7,
        le=30,
        examples=[7],
    )

    include_sentiment: bool = True

    include_weather: bool = True


    @field_validator("crop")
    @classmethod
    def validate_crop(cls, value: str) -> str:

        value = value.lower().strip()

        if value not in VALID_CROPS:
            raise ValueError(
                f"crop must be one of {sorted(VALID_CROPS)}"
            )

        return value


    @field_validator("state")
    @classmethod
    def validate_state(cls, value: str) -> str:

        normalized = value.lower().strip()

        if normalized not in VALID_STATES:
            raise ValueError(
                "Unsupported state. "
                f"Supported states are: "
                f"{list(VALID_STATES.values())}"
            )

        return VALID_STATES[normalized]


    @field_validator("market", "district")
    @classmethod
    def validate_location_fields(cls, value: str) -> str:

        value = value.strip()

        if not value:
            raise ValueError(
                "Field cannot be empty"
            )

        return value


# ==================================================
# DAILY FORECAST MODEL
# ==================================================

class DailyForecast(BaseModel):

    date: str

    predicted_price: float

    lower_bound: float

    upper_bound: float


# ==================================================
# RESPONSE MODEL
# ==================================================

class PredictResponse(BaseModel):

    crop: str

    market: str

    state: str

    district: str

    prediction_date: str

    days_ahead: int

    current_price_inr: float

    raw_lstm_prediction_inr: float

    predicted_price_inr: float

    price_change_pct: float

    confidence_score: Optional[int]

    trend: str

    trend_emoji: str

    mape_score: Optional[float]

    model_used: str

    confidence_interval: dict

    sentiment_score: Optional[float]

    sentiment_label: Optional[str]

    sentiment_reason: Optional[str]

    weather_condition: Optional[str]

    weather_impact: Optional[str]

    daily_forecast: List[DailyForecast]

    advisory_action: str

    recommendation: str

    warehouse_advisory: Optional[dict]

    hindi_summary: str

    data_sources: List[str]


# ==================================================
# HELPER FUNCTIONS
# ==================================================

def get_trend(
    change_pct: float,
):

    if change_pct > 2:
        return "bullish", "UP"

    if change_pct < -2:
        return "bearish", "DOWN"

    return "neutral", "STABLE"


def calculate_confidence_score(
    mape: Optional[float],
) -> Optional[int]:

    """
    Converts historical MAPE into a presentation score.

    This is not a statistical probability.
    """

    if mape is None:
        return None

    score = 100 - (
        float(mape) * 2
    )

    score = max(
        0,
        min(
            100,
            score,
        ),
    )

    return int(
        round(score)
    )


def build_daily_forecast(
    raw_daily_forecast: list,
) -> List[DailyForecast]:

    """
    Converts ML service output into the public API format.

    Supports both:

    Format A:
        price / lower / upper

    Format B:
        predicted_price / lower_bound / upper_bound
    """

    if not raw_daily_forecast:
        raise HTTPException(
            status_code=500,
            detail=(
                "Prediction model returned "
                "an empty daily forecast"
            ),
        )

    daily_forecast = []

    for forecast_day in raw_daily_forecast:

        try:

            predicted_price = (
                forecast_day.get(
                    "predicted_price",
                    forecast_day.get("price"),
                )
            )

            lower_bound = (
                forecast_day.get(
                    "lower_bound",
                    forecast_day.get("lower"),
                )
            )

            upper_bound = (
                forecast_day.get(
                    "upper_bound",
                    forecast_day.get("upper"),
                )
            )

            if (
                predicted_price is None
                or lower_bound is None
                or upper_bound is None
            ):
                raise ValueError(
                    "Missing forecast price fields"
                )

            daily_forecast.append(

                DailyForecast(

                    date=str(
                        forecast_day["date"]
                    ),

                    predicted_price=round(
                        float(
                            predicted_price
                        ),
                        2,
                    ),

                    lower_bound=round(
                        float(
                            lower_bound
                        ),
                        2,
                    ),

                    upper_bound=round(
                        float(
                            upper_bound
                        ),
                        2,
                    ),

                )

            )

        except (
            KeyError,
            TypeError,
            ValueError,
        ) as error:

            raise HTTPException(
                status_code=500,
                detail=(
                    "Prediction model returned "
                    "an invalid daily forecast"
                ),
            ) from error


    return daily_forecast


# ==================================================
# MAIN PREDICTION ROUTE
# ==================================================

@router.post(
    "/predict",
    response_model=PredictResponse,
    summary="Predict crop mandi price",
)
def predict_price(
    req: PredictRequest,
):

    # ----------------------------------------------
    # LSTM FORECAST
    # ----------------------------------------------

    try:

        ml_result = lstm_svc.predict(

            crop=req.crop,

            market=req.market,

            days_ahead=req.days_ahead,

        )

    except Exception as error:

        # Do not expose internal model details
        # directly to production users.

        raise HTTPException(

            status_code=500,

            detail=(
                "Prediction service failed. "
                "Please try again later."
            ),

        ) from error


    # ----------------------------------------------
    # CORE MODEL VALUES
    # ----------------------------------------------

    try:

        current_price = float(
            ml_result["current_price"]
        )

        predicted_price = float(
            ml_result["predicted_price"]
        )

    except (
        KeyError,
        TypeError,
        ValueError,
    ) as error:

        raise HTTPException(

            status_code=500,

            detail=(
                "Prediction model returned "
                "invalid price data"
            ),

        ) from error


    if current_price <= 0:

        raise HTTPException(

            status_code=500,

            detail=(
                "Invalid current price returned "
                "by prediction model"
            ),

        )


    # ----------------------------------------------
    # MODEL EVALUATION
    # ----------------------------------------------

    raw_mape = ml_result.get(
        "mape"
    )

    mape = (

        float(raw_mape)

        if raw_mape is not None

        else None

    )


    confidence_score = (
        calculate_confidence_score(
            mape
        )
    )


    # ----------------------------------------------
    # WEATHER CONTEXT
    # ----------------------------------------------

    weather_condition = None

    weather_impact = None


    if req.include_weather:

        try:

            weather_result = (
                weather_svc.get_weather(
                    req.state
                )
            )

            weather_condition = (
                weather_result.get(
                    "condition"
                )
            )

            weather_impact = (
                weather_result.get(
                    "impact"
                )
            )

        except Exception:

            weather_condition = (
                "unknown"
            )

            weather_impact = (
                "Weather data unavailable"
            )


    # ----------------------------------------------
    # NEWS SENTIMENT CONTEXT
    # ----------------------------------------------

    sentiment_score = None

    sentiment_label = None

    sentiment_reason = None


    if req.include_sentiment:

        try:

            sentiment_result = (
                news_svc.get_sentiment(
                    req.crop
                )
            )

            sentiment_score = float(

                sentiment_result.get(
                    "sentiment",
                    0.0,
                )

            )

            sentiment_label = (
                sentiment_result.get(
                    "label",
                    "neutral",
                )
            )

            sentiment_reason = (
                sentiment_result.get(
                    "reason",
                    "No sentiment data available",
                )
            )

        except Exception:

            sentiment_score = 0.0

            sentiment_label = (
                "neutral"
            )

            sentiment_reason = (
                "Sentiment data unavailable"
            )


    # ----------------------------------------------
    # FINAL PREDICTION
    # ----------------------------------------------

    final_predicted_price = round(

        predicted_price,

        2,

    )


    # ----------------------------------------------
    # PRICE CHANGE
    # ----------------------------------------------

    price_change_pct = round(

        (

            (

                final_predicted_price

                - current_price

            )

            / current_price

        )

        * 100,

        2,

    )


    trend, trend_indicator = (
        get_trend(
            price_change_pct
        )
    )


    # ----------------------------------------------
    # DAILY FORECAST
    # ----------------------------------------------

    raw_daily_forecast = (
        ml_result.get(
            "daily_forecast",
            [],
        )
    )


    daily_forecast = (
        build_daily_forecast(
            raw_daily_forecast
        )
    )


    if len(daily_forecast) != req.days_ahead:

        raise HTTPException(

            status_code=500,

            detail=(
                "Prediction model returned an "
                "unexpected number of forecast days"
            ),

        )


    # ----------------------------------------------
    # CONFIDENCE INTERVAL
    # ----------------------------------------------

    try:

        ci_lower = round(

            float(
                ml_result["lower"]
            ),

            2,

        )

        ci_upper = round(

            float(
                ml_result["upper"]
            ),

            2,

        )

    except (
        KeyError,
        TypeError,
        ValueError,
    ) as error:

        raise HTTPException(

            status_code=500,

            detail=(
                "Prediction model returned "
                "invalid confidence bounds"
            ),

        ) from error


    # ----------------------------------------------
    # ADVISORY
    # ----------------------------------------------

    if trend == "bearish":

        advisory_action = "SELL"

        recommendation = (

            "The model forecasts a meaningful price "
            "decline. Consider selling sooner if market "
            "conditions remain consistent."

        )


    elif trend == "bullish":

        advisory_action = "HOLD"

        recommendation = (

            "The model forecasts a meaningful price "
            "increase. Holding may provide a better "
            "selling opportunity."

        )


    else:

        advisory_action = "WAIT"

        recommendation = (

            "The model forecasts relatively stable "
            "prices. Monitor market conditions before "
            "making a selling decision."

        )


    # ----------------------------------------------
    # DATA SOURCES
    # ----------------------------------------------

    data_sources = [
        "Crop price dataset",
    ]


    if req.include_sentiment:

        data_sources.append(
            "News sentiment"
        )


    if req.include_weather:

        data_sources.append(
            "Weather service"
        )


    # ----------------------------------------------
    # PREDICTION DATE
    # ----------------------------------------------

    prediction_date = (
        daily_forecast[-1].date
    )


    # ----------------------------------------------
    # FINAL RESPONSE
    # ----------------------------------------------

    return PredictResponse(

        crop=req.crop,

        market=req.market,

        state=req.state,

        district=req.district,

        prediction_date=prediction_date,

        days_ahead=req.days_ahead,

        current_price_inr=current_price,

        raw_lstm_prediction_inr=predicted_price,

        predicted_price_inr=final_predicted_price,

        price_change_pct=price_change_pct,

        confidence_score=confidence_score,

        trend=trend,

        trend_emoji=trend_indicator,

        mape_score=mape,

        model_used=(
            "LSTM (TensorFlow/Keras)"
        ),

        confidence_interval={

            "lower": ci_lower,

            "upper": ci_upper,

            "level": (
                "Model forecast range"
            ),

        },

        sentiment_score=sentiment_score,

        sentiment_label=sentiment_label,

        sentiment_reason=sentiment_reason,

        weather_condition=weather_condition,

        weather_impact=weather_impact,

        daily_forecast=daily_forecast,

        advisory_action=advisory_action,

        recommendation=recommendation,

        warehouse_advisory=None,

        hindi_summary=HINDI_SUMMARY,

        data_sources=data_sources,

    )