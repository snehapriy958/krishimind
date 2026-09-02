"""
backend/services/lstm_service.py

Service layer between FastAPI prediction routes and the
KrishiMind LSTM forecasting engine.
"""

import os
import sys
from typing import Any, Dict


# ==================================================
# PATH CONFIGURATION
# ==================================================

THIS_FILE = os.path.abspath(__file__)

SERVICES_DIR = os.path.dirname(THIS_FILE)
BACKEND_DIR = os.path.dirname(SERVICES_DIR)
ROOT_DIR = os.path.dirname(BACKEND_DIR)

if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)


# ==================================================
# ML IMPORT
# ==================================================

from ml.predict_prices import forecast_crop


# ==================================================
# LSTM SERVICE
# ==================================================

class LSTMService:
    """
    Service layer between FastAPI routes and the ML
    forecasting engine.

    Current trained models are crop-level models.

    The market parameter is retained for API compatibility
    and response context, but it does not directly influence
    the LSTM prediction because market/location features were
    not included during model training.
    """

    def __init__(self) -> None:
        pass


    def predict(
        self,
        crop: str,
        market: str,
        days_ahead: int,
    ) -> Dict[str, Any]:
        """
        Generate an LSTM price forecast.

        Parameters
        ----------
        crop:
            Crop name.

        market:
            Selected mandi/market. Retained for API context.

        days_ahead:
            Number of forecast days.

        Returns
        -------
        dict
            Standardized forecasting result.
        """

        try:

            # ------------------------------------------
            # VALIDATION
            # ------------------------------------------

            crop = crop.strip().lower()
            market = market.strip()

            if not crop:
                raise ValueError("Crop cannot be empty.")

            if not market:
                raise ValueError("Market cannot be empty.")

            if days_ahead <= 0:
                raise ValueError(
                    "days_ahead must be greater than 0."
                )


            # ------------------------------------------
            # RUN LSTM FORECAST
            # ------------------------------------------

            result = forecast_crop(
                crop=crop,
                forecast_days=days_ahead,
            )


            # ------------------------------------------
            # EXTRACT FORECAST DATA
            # ------------------------------------------

            forecast_series = result["forecast_series"]
            forecast_dates = result["forecast_dates"]
            lower_band = result["lower_band"]
            upper_band = result["upper_band"]


            # ------------------------------------------
            # SAFETY CHECK
            # ------------------------------------------

            required_length = days_ahead

            if (
                len(forecast_series) < required_length
                or len(forecast_dates) < required_length
                or len(lower_band) < required_length
                or len(upper_band) < required_length
            ):
                raise ValueError(
                    "Forecast engine returned fewer records "
                    f"than requested. Requested: {days_ahead}."
                )


            # ------------------------------------------
            # BUILD DAILY FORECAST
            # ------------------------------------------

            daily_forecast = []

            for index in range(days_ahead):

                daily_forecast.append(
                    {
                        "date": str(
                            forecast_dates[index]
                        ),

                        "predicted_price": round(
                            float(
                                forecast_series[index]
                            ),
                            2,
                        ),

                        "lower_bound": round(
                            float(
                                lower_band[index]
                            ),
                            2,
                        ),

                        "upper_bound": round(
                            float(
                                upper_band[index]
                            ),
                            2,
                        ),
                    }
                )


            # ------------------------------------------
            # FINAL FORECAST VALUES
            # ------------------------------------------

            current_price = round(
                float(result["today_price"]),
                2,
            )

            predicted_price = round(
                float(result["predicted_price"]),
                2,
            )

            final_lower = round(
                float(lower_band[-1]),
                2,
            )

            final_upper = round(
                float(upper_band[-1]),
                2,
            )


            # ------------------------------------------
            # RETURN STANDARDIZED RESULT
            # ------------------------------------------

            return {

                # --------------------------------------
                # PRICE DATA
                # --------------------------------------

                "current_price": current_price,

                "predicted_price": predicted_price,

                "lower": final_lower,

                "upper": final_upper,


                # --------------------------------------
                # MODEL METRICS
                # --------------------------------------

                "mape": self._safe_float(
                    result.get("mape")
                ),

                "mae": self._safe_float(
                    result.get("mae")
                ),

                "rmse": self._safe_float(
                    result.get("rmse")
                ),


                # --------------------------------------
                # FORECAST ANALYTICS
                # --------------------------------------

                "trend_percent": self._safe_float(
                    result.get("trend_percent")
                ),

                "peak_day": result.get(
                    "peak_day"
                ),

                "peak_price": self._safe_float(
                    result.get("peak_price")
                ),

                "advice": result.get(
                    "advice"
                ),


                # --------------------------------------
                # REQUEST CONTEXT
                # --------------------------------------

                "market_used": market,

                "crop_used": crop,

                "forecast_days": days_ahead,


                # --------------------------------------
                # DAILY FORECAST
                # --------------------------------------

                "daily_forecast": daily_forecast,
            }


        except Exception as error:

            raise RuntimeError(
                f"LSTM prediction failed for crop "
                f"'{crop}' and market '{market}': "
                f"{str(error)}"
            ) from error


    # ==================================================
    # SAFE NUMBER CONVERSION
    # ==================================================

    @staticmethod
    def _safe_float(
        value: Any,
    ) -> float | None:
        """
        Convert NumPy/TensorFlow numeric values into
        standard Python floats for JSON serialization.
        """

        if value is None:
            return None

        try:
            return round(
                float(value),
                4,
            )

        except (
            TypeError,
            ValueError,
        ):
            return None