"""
KrishiMind - ML Inference Engine

Loads trained LSTM models and performs crop price forecasting.

Important limitation:
The original training pipeline and raw datasets are not available in the
repository history. The saved models are therefore used for inference only.

Forecasting uses recursive inference and recalculates price-derived features
from predicted prices for each future step.
"""

import json
import os
import pickle

import numpy as np
import pandas as pd
import tensorflow as tf
from tensorflow import keras


# -------------------------------------------------
# REPRODUCIBILITY
# -------------------------------------------------

np.random.seed(42)


# -------------------------------------------------
# PATH CONFIGURATION
# -------------------------------------------------

ML_DIR = os.path.dirname(
    os.path.abspath(__file__)
)

ROOT_DIR = os.path.dirname(
    ML_DIR
)

MODELS_DIR = os.path.join(
    ROOT_DIR,
    "models"
)

DATA_DIR = os.path.join(
    ROOT_DIR,
    "data",
    "processed"
)

METRICS_PATH = os.path.join(
    MODELS_DIR,
    "evaluation_metrics.json"
)


# -------------------------------------------------
# MODEL CONFIGURATION
# -------------------------------------------------

CROPS = [
    "onion",
    "tomato",
    "potato",
    "rice",
    "wheat",
]

SEQ_LEN = 30
FEATURES = 14


FEATURE_COLS = [
    "price_lag_1",
    "price_lag_3",
    "price_lag_7",
    "price_lag_14",
    "price_lag_30",
    "price_lag_60",
    "rolling_mean_7",
    "rolling_mean_14",
    "rolling_std_7",
    "arrivals_mt",
    "weekly_arrival_change",
    "day_of_week",
    "month",
    "quarter",
]


# -------------------------------------------------
# LOAD EVALUATION METRICS
# -------------------------------------------------

EVALUATION_METRICS = {}


if os.path.exists(
    METRICS_PATH
):

    try:

        with open(
            METRICS_PATH,
            "r",
            encoding="utf-8"
        ) as file:

            EVALUATION_METRICS = json.load(
                file
            )

        print(
            "Evaluation metrics loaded successfully"
        )

    except Exception as error:

        print(
            "Warning: Could not load "
            f"evaluation metrics: {error}"
        )

else:

    print(
        "Warning: evaluation_metrics.json "
        "not found"
    )


# -------------------------------------------------
# STARTUP INFORMATION
# -------------------------------------------------

print(
    f"ROOT_DIR: {ROOT_DIR}"
)

print(
    f"MODELS_DIR: {MODELS_DIR}"
)

print(
    f"DATA_DIR: {DATA_DIR}"
)

print(
    f"TensorFlow version: {tf.__version__}"
)


# -------------------------------------------------
# KERAS COMPATIBILITY PATCH
# -------------------------------------------------

class CompatibleLSTM(
    keras.layers.LSTM
):

    def __init__(
        self,
        *args,
        **kwargs
    ):

        kwargs.pop(
            "time_major",
            None
        )

        super().__init__(
            *args,
            **kwargs
        )

    @classmethod
    def from_config(
        cls,
        config
    ):

        config.pop(
            "time_major",
            None
        )

        return super().from_config(
            config
        )


class CompatibleBidirectional(
    keras.layers.Bidirectional
):

    @classmethod
    def from_config(
        cls,
        config
    ):

        if (
            "layer" in config
            and
            "config" in config[
                "layer"
            ]
        ):

            config[
                "layer"
            ][
                "config"
            ].pop(
                "time_major",
                None
            )

        return super().from_config(
            config
        )


CUSTOM_OBJECTS = {

    "LSTM":
        CompatibleLSTM,

    "Bidirectional":
        CompatibleBidirectional,

}


# -------------------------------------------------
# LOAD MODELS AND SCALERS
# -------------------------------------------------

MODELS = {}

SCALER_X = {}

SCALER_Y = {}


for crop in CROPS:

    model_path = os.path.join(
        MODELS_DIR,
        f"krishimind_{crop}.h5"
    )

    scaler_x_path = os.path.join(
        MODELS_DIR,
        f"scaler_X_{crop}.pkl"
    )

    scaler_y_path = os.path.join(
        MODELS_DIR,
        f"scaler_y_{crop}.pkl"
    )


    if not os.path.exists(
        model_path
    ):

        print(
            f"Missing model for {crop}: "
            f"{model_path}"
        )

        continue


    if not os.path.exists(
        scaler_x_path
    ):

        print(
            f"Missing X scaler for {crop}: "
            f"{scaler_x_path}"
        )

        continue


    if not os.path.exists(
        scaler_y_path
    ):

        print(
            f"Missing y scaler for {crop}: "
            f"{scaler_y_path}"
        )

        continue


    try:

        MODELS[crop] = (
            keras.models.load_model(

                model_path,

                custom_objects=
                    CUSTOM_OBJECTS,

                compile=False,

            )
        )


        with open(
            scaler_x_path,
            "rb"
        ) as file:

            SCALER_X[crop] = (
                pickle.load(
                    file
                )
            )


        with open(
            scaler_y_path,
            "rb"
        ) as file:

            SCALER_Y[crop] = (
                pickle.load(
                    file
                )
            )


        print(
            f"Loaded model for {crop}"
        )


    except Exception as error:

        print(
            f"Failed loading {crop}: "
            f"{error}"
        )


print(
    "Models loaded: "
    f"{list(MODELS.keys())}"
)


# -------------------------------------------------
# HELPER FUNCTIONS
# -------------------------------------------------

def smooth_series(
    series
):
    """
    Apply exponential smoothing.
    """

    smoothed = []


    for index in range(
        len(series)
    ):

        if index == 0:

            smoothed.append(
                float(
                    series[index]
                )
            )

        else:

            value = (

                0.7
                *
                float(
                    series[index]
                )

                +

                0.3
                *
                smoothed[
                    index - 1
                ]

            )

            smoothed.append(
                value
            )


    return np.asarray(
        smoothed,
        dtype=float
    )


def calculate_arrival_change(
    arrivals
):
    """
    Calculate percentage change compared
    with the value 7 observations earlier.
    """

    if len(arrivals) < 8:

        return 0.0


    current = float(
        arrivals[-1]
    )

    previous = float(
        arrivals[-8]
    )


    if previous == 0:

        return 0.0


    return float(

        (
            current
            -
            previous
        )

        /

        abs(
            previous
        )

    )


def get_lag_value(
    prices,
    lag
):
    """
    Return the price lag observations
    before the most recent price.

    Example:
    lag=1 -> latest price
    lag=3 -> third latest price
    """

    if len(prices) >= lag:

        return float(
            prices[-lag]
        )


    return float(
        prices[0]
    )


def build_future_feature_row(
    price_history,
    arrival_history,
    future_date
):
    """
    Build one feature row in ORIGINAL units.

    The predicted prices already stored in
    price_history are used to update lag and
    rolling features recursively.

    Future arrivals are held at the most recent
    observed arrival level because no separate
    future-arrival model exists.
    """

    recent_arrival = float(
        arrival_history[-1]
    )


    price_lag_1 = get_lag_value(
        price_history,
        1
    )

    price_lag_3 = get_lag_value(
        price_history,
        3
    )

    price_lag_7 = get_lag_value(
        price_history,
        7
    )

    price_lag_14 = get_lag_value(
        price_history,
        14
    )

    price_lag_30 = get_lag_value(
        price_history,
        30
    )

    price_lag_60 = get_lag_value(
        price_history,
        60
    )


    last_7 = np.asarray(
        price_history[-7:],
        dtype=float
    )

    last_14 = np.asarray(
        price_history[-14:],
        dtype=float
    )


    rolling_mean_7 = float(
        np.mean(
            last_7
        )
    )

    rolling_mean_14 = float(
        np.mean(
            last_14
        )
    )


    if len(last_7) > 1:

        rolling_std_7 = float(
            np.std(
                last_7,
                ddof=1
            )
        )

    else:

        rolling_std_7 = 0.0


    weekly_arrival_change = (
        calculate_arrival_change(
            arrival_history
        )
    )


    future_timestamp = (
        pd.Timestamp(
            future_date
        )
    )


    row = {

        "price_lag_1":
            price_lag_1,

        "price_lag_3":
            price_lag_3,

        "price_lag_7":
            price_lag_7,

        "price_lag_14":
            price_lag_14,

        "price_lag_30":
            price_lag_30,

        "price_lag_60":
            price_lag_60,

        "rolling_mean_7":
            rolling_mean_7,

        "rolling_mean_14":
            rolling_mean_14,

        "rolling_std_7":
            rolling_std_7,

        "arrivals_mt":
            recent_arrival,

        "weekly_arrival_change":
            weekly_arrival_change,

        "day_of_week":
            int(
                future_timestamp.dayofweek
            ),

        "month":
            int(
                future_timestamp.month
            ),

        "quarter":
            int(
                future_timestamp.quarter
            ),

    }


    return np.asarray(

        [
            row[
                column
            ]

            for column
            in FEATURE_COLS
        ],

        dtype=float

    )


# -------------------------------------------------
# FORECAST FUNCTION
# -------------------------------------------------

def forecast_crop(
    crop: str,
    forecast_days: int = 14
):
    """
    Generate a recursive crop price forecast.

    Each predicted price is fed back into the
    feature engineering pipeline so that future
    lag and rolling features evolve across the
    forecast horizon.
    """

    crop = crop.lower().strip()


    if crop not in MODELS:

        raise ValueError(
            f"Model not loaded "
            f"for crop '{crop}'"
        )


    if forecast_days < 1:

        raise ValueError(
            "forecast_days must be "
            "at least 1"
        )


    model = MODELS[
        crop
    ]

    scaler_x = SCALER_X[
        crop
    ]

    scaler_y = SCALER_Y[
        crop
    ]


    # ---------------------------------------------
    # LOAD DATA
    # ---------------------------------------------

    features_file = os.path.join(

        DATA_DIR,

        f"features_{crop}.csv"

    )


    if not os.path.exists(
        features_file
    ):

        raise FileNotFoundError(

            f"Feature file not found: "
            f"{features_file}"

        )


    df = pd.read_csv(
        features_file
    )


    missing_columns = [

        column

        for column

        in (
            FEATURE_COLS
            +
            [
                "date",
                "modal_price",
                "arrivals_mt",
            ]
        )

        if column not in df.columns

    ]


    if missing_columns:

        raise ValueError(

            f"Missing required columns "
            f"for crop '{crop}': "
            f"{missing_columns}"

        )


    if len(df) < SEQ_LEN:

        raise ValueError(

            f"Not enough rows for crop "
            f"'{crop}'. "

            f"Required: {SEQ_LEN}, "

            f"available: {len(df)}"

        )


    # ---------------------------------------------
    # INITIAL HISTORICAL DATA
    # ---------------------------------------------

    price_history = list(

        df[
            "modal_price"
        ]
        .astype(
            float
        )
        .values

    )


    arrival_history = list(

        df[
            "arrivals_mt"
        ]
        .astype(
            float
        )
        .values

    )


    last_date = pd.to_datetime(

        df[
            "date"
        ]
        .iloc[-1]

    )


    # ---------------------------------------------
    # INITIAL MODEL SEQUENCE
    # ---------------------------------------------

    historical_sequence = (

        df[
            FEATURE_COLS
        ]
        .tail(
            SEQ_LEN
        )
        .values

    )


    sequence = scaler_x.transform(

        historical_sequence

    )


    predictions = []

    forecast_dates = []


    # ---------------------------------------------
    # RECURSIVE FORECAST
    # ---------------------------------------------

    for step in range(
        forecast_days
    ):

        seq_input = sequence.reshape(

            1,

            SEQ_LEN,

            FEATURES,

        )


        scaled_prediction = (

            model.predict(

                seq_input,

                verbose=0,

            )

        )


        predicted_price = float(

            scaler_y.inverse_transform(

                scaled_prediction

            )[0][0]

        )


        predictions.append(

            predicted_price

        )


        future_date = (

            last_date

            +

            pd.Timedelta(

                days=step + 1

            )

        )


        forecast_dates.append(

            future_date.strftime(
                "%Y-%m-%d"
            )

        )


        # -----------------------------------------
        # UPDATE HISTORIES
        # -----------------------------------------

        price_history.append(

            predicted_price

        )


        # No future arrival model exists.
        # Carry forward the latest arrival.

        future_arrival = float(

            arrival_history[-1]

        )


        arrival_history.append(

            future_arrival

        )


        # -----------------------------------------
        # BUILD NEXT FEATURE VECTOR
        # -----------------------------------------

        next_features = (

            build_future_feature_row(

                price_history=

                    price_history,

                arrival_history=

                    arrival_history,

                future_date=

                    future_date,

            )

        )


        next_features_scaled = (

            scaler_x.transform(

                next_features.reshape(
                    1,
                    -1
                )

            )[0]

        )


        # Remove oldest timestep and
        # append new future feature vector.

        sequence = np.vstack(

            [

                sequence[
                    1:
                ],

                next_features_scaled,

            ]

        )


    # ---------------------------------------------
    # SMOOTH FORECAST
    # ---------------------------------------------

    predictions = np.asarray(

        predictions,

        dtype=float

    )


    predictions = smooth_series(

        predictions

    )


    # ---------------------------------------------
    # LIGHT MOVING-AVERAGE SMOOTHING
    # ---------------------------------------------

    window = 3

    smoothed_predictions = []


    for index in range(
        len(predictions)
    ):

        start = max(

            0,

            index - window + 1

        )


        value = float(

            np.mean(

                predictions[
                    start:
                    index + 1
                ]

            )

        )


        smoothed_predictions.append(

            value

        )


    predictions = np.asarray(

        smoothed_predictions,

        dtype=float

    )


    # ---------------------------------------------
    # CURRENT PRICE
    # ---------------------------------------------

    today_price = float(

        df[
            "modal_price"
        ]
        .iloc[-1]

    )


    final_predicted_price = float(

        predictions[-1]

    )


    # ---------------------------------------------
    # TREND
    # ---------------------------------------------

    trend_percent = float(

        (

            (

                final_predicted_price

                -

                today_price

            )

            /

            today_price

        )

        *

        100

    )


    # ---------------------------------------------
    # PEAK
    # ---------------------------------------------

    peak_day = int(

        np.argmax(
            predictions
        )

        +

        1

    )


    peak_price = float(

        np.max(
            predictions
        )

    )


    # ---------------------------------------------
    # UNCERTAINTY BANDS
    # ---------------------------------------------

    forecast_std = float(

        np.std(
            predictions
        )

    )


    if forecast_std == 0:

        forecast_std = (

            today_price

            *

            0.01

        )


    time_scale = np.linspace(

        1.0,

        1.5,

        len(
            predictions
        )

    )


    upper_band = (

        predictions

        +

        (

            1.96

            *

            forecast_std

            *

            time_scale

        )

    )


    lower_band = (

        predictions

        -

        (

            1.96

            *

            forecast_std

            *

            time_scale

        )

    )


    # ---------------------------------------------
    # METRICS
    # ---------------------------------------------

    crop_metrics = (

        EVALUATION_METRICS.get(

            crop,

            {}

        )

    )


    mae = float(

        crop_metrics.get(

            "mae",

            0.0

        )

    )


    rmse = float(

        crop_metrics.get(

            "rmse",

            0.0

        )

    )


    mape = float(

        crop_metrics.get(

            "mape",

            0.0

        )

    )


    # ---------------------------------------------
    # ADVICE
    # ---------------------------------------------

    if trend_percent > 5:

        advice = "WAIT"

    elif trend_percent < -5:

        advice = "SELL"

    else:

        advice = "HOLD"


    # ---------------------------------------------
    # RESPONSE
    # ---------------------------------------------

    return {

        "today_price":

            round(
                today_price,
                2
            ),

        "predicted_price":

            round(
                final_predicted_price,
                2
            ),

        "mape":

            round(
                mape,
                2
            ),

        "mae":

            round(
                mae,
                2
            ),

        "rmse":

            round(
                rmse,
                2
            ),

        "trend_percent":

            round(
                trend_percent,
                2
            ),

        "peak_day":

            peak_day,

        "peak_price":

            round(
                peak_price,
                2
            ),

        "advice":

            advice,

        "forecast_dates":

            forecast_dates,

        "forecast_series":

            [

                round(
                    float(value),
                    2
                )

                for value
                in predictions

            ],

        "upper_band":

            [

                round(
                    float(value),
                    2
                )

                for value
                in upper_band

            ],

        "lower_band":

            [

                round(
                    float(value),
                    2
                )

                for value
                in lower_band

            ],

    }