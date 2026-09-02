"""
backend/services/lstm_service.py

Bridge between FastAPI routes and the ML inference engine.
"""

import os
import sys
from typing import Dict


# -------------------------------------------------
# PATH CONFIGURATION
# -------------------------------------------------

THIS_FILE = os.path.abspath(__file__)

SERVICES_DIR = os.path.dirname(THIS_FILE)
BACKEND_DIR = os.path.dirname(SERVICES_DIR)
ROOT_DIR = os.path.dirname(BACKEND_DIR)


if ROOT_DIR not in sys.path:
    sys.path.insert(
        0,
        ROOT_DIR
    )


print(
    f"LSTMService ROOT_DIR = {ROOT_DIR}"
)


# -------------------------------------------------
# ML IMPORT
# -------------------------------------------------

from ml.predict_prices import forecast_crop


# -------------------------------------------------
# LSTM SERVICE
# -------------------------------------------------

class LSTMService:
    """
    Service layer between FastAPI prediction routes
    and the crop forecasting engine.

    The current trained models are crop-level models.

    The market parameter is retained for API compatibility,
    but does not currently influence the ML prediction because
    market/location features were not included during training.
    """

    def __init__(self):

        print(
            "LSTMService initialized"
        )


    def predict(
        self,
        crop: str,
        market: str,
        days_ahead: int
    ) -> Dict:

        try:

            # ---------------------------------------------
            # RUN ML FORECAST
            # ---------------------------------------------

            result = forecast_crop(

                crop=crop,

                forecast_days=days_ahead,

            )


            # ---------------------------------------------
            # EXTRACT FORECAST DATA
            # ---------------------------------------------

            forecast_series = result[
                "forecast_series"
            ]

            forecast_dates = result[
                "forecast_dates"
            ]

            lower_band = result[
                "lower_band"
            ]

            upper_band = result[
                "upper_band"
            ]


            # ---------------------------------------------
            # BUILD DAILY FORECAST
            # ---------------------------------------------

            daily_forecast = []


            for index in range(
                days_ahead
            ):

                daily_forecast.append({

                    "date":

                        forecast_dates[
                            index
                        ],


                    "price":

                        round(

                            float(
                                forecast_series[
                                    index
                                ]
                            ),

                            2

                        ),


                    "lower":

                        round(

                            float(
                                lower_band[
                                    index
                                ]
                            ),

                            2

                        ),


                    "upper":

                        round(

                            float(
                                upper_band[
                                    index
                                ]
                            ),

                            2

                        ),

                })


            # ---------------------------------------------
            # RETURN STANDARDIZED RESULT
            # ---------------------------------------------

            return {

                "current_price":

                    round(

                        float(
                            result[
                                "today_price"
                            ]
                        ),

                        2

                    ),


                "predicted_price":

                    round(

                        float(
                            result[
                                "predicted_price"
                            ]
                        ),

                        2

                    ),


                "lower":

                    round(

                        float(
                            lower_band[-1]
                        ),

                        2

                    ),


                "upper":

                    round(

                        float(
                            upper_band[-1]
                        ),

                        2

                    ),


                # ---------------------------------
                # REAL MODEL EVALUATION METRICS
                # ---------------------------------

                "mape":

                    result.get(
                        "mape"
                    ),


                "mae":

                    result.get(
                        "mae"
                    ),


                "rmse":

                    result.get(
                        "rmse"
                    ),


                # ---------------------------------
                # FORECAST ANALYTICS
                # ---------------------------------

                "trend_percent":

                    result.get(
                        "trend_percent"
                    ),


                "peak_day":

                    result.get(
                        "peak_day"
                    ),


                "peak_price":

                    result.get(
                        "peak_price"
                    ),


                "advice":

                    result.get(
                        "advice"
                    ),


                # ---------------------------------
                # API COMPATIBILITY INFORMATION
                # ---------------------------------

                "market_used":

                    market,


                # ---------------------------------
                # DAILY FORECAST
                # ---------------------------------

                "daily_forecast":

                    daily_forecast,

            }


        except Exception as error:

            raise RuntimeError(

                f"LSTM prediction failed "

                f"for crop '{crop}' "

                f"and market '{market}': "

                f"{str(error)}"

            )