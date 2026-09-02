"""
KrishiMind — Post-hoc Model Evaluation

Evaluates saved LSTM models using chronological rolling one-step predictions.

Important:
This is a reproducible post-hoc evaluation using the processed historical
dataset currently available in the project. It is not necessarily identical
to the original training-time validation/test split because the original
training pipeline is not present.
"""

import json
import os
import sys
import pickle

import numpy as np
import pandas as pd


# -------------------------------------------------
# PATH SETUP
# -------------------------------------------------

ML_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.dirname(ML_DIR)

if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)


# Import after path setup
from ml.predict_prices import (
    MODELS,
    SCALER_X,
    SCALER_Y,
    CROPS,
    SEQ_LEN,
)


# -------------------------------------------------
# CONFIG
# -------------------------------------------------

DATA_DIR = os.path.join(ROOT_DIR, "data", "processed")
MODELS_DIR = os.path.join(ROOT_DIR, "models")

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
# METRICS
# -------------------------------------------------

def calculate_metrics(actual, predicted):
    """
    Calculate regression metrics.

    MAPE ignores observations where the actual value is zero.
    """

    actual = np.asarray(actual, dtype=float)
    predicted = np.asarray(predicted, dtype=float)

    mae = np.mean(np.abs(actual - predicted))

    rmse = np.sqrt(
        np.mean(
            (actual - predicted) ** 2
        )
    )

    non_zero = actual != 0

    if np.any(non_zero):
        mape = np.mean(
            np.abs(
                (
                    actual[non_zero]
                    - predicted[non_zero]
                )
                / actual[non_zero]
            )
        ) * 100
    else:
        mape = 0.0

    return {
        "mae": round(float(mae), 4),
        "rmse": round(float(rmse), 4),
        "mape": round(float(mape), 4),
    }


# -------------------------------------------------
# EVALUATE ONE CROP
# -------------------------------------------------

def evaluate_crop(crop: str):

    if crop not in MODELS:
        raise ValueError(
            f"Model not loaded for crop '{crop}'"
        )

    features_file = os.path.join(
        DATA_DIR,
        f"features_{crop}.csv"
    )

    if not os.path.exists(features_file):
        raise FileNotFoundError(
            f"Features file not found: {features_file}"
        )

    df = pd.read_csv(features_file)

    model = MODELS[crop]
    scaler_x = SCALER_X[crop]
    scaler_y = SCALER_Y[crop]

    actual_prices = []
    predicted_prices = []

    # -------------------------------------------------
    # ROLLING ONE-STEP EVALUATION
    #
    # First prediction:
    # rows 0..29 -> predict row 30
    #
    # Next prediction:
    # rows 1..30 -> predict row 31
    # -------------------------------------------------

    for target_index in range(
        SEQ_LEN,
        len(df)
    ):

        start_index = (
            target_index - SEQ_LEN
        )

        end_index = target_index

        sequence = (
            df.iloc[
                start_index:end_index
            ][FEATURE_COLS]
            .values
        )

        sequence_scaled = (
            scaler_x.transform(sequence)
        )

        model_input = (
            sequence_scaled.reshape(
                1,
                SEQ_LEN,
                len(FEATURE_COLS)
            )
        )

        scaled_prediction = model.predict(
            model_input,
            verbose=0
        )

        prediction = (
            scaler_y.inverse_transform(
                scaled_prediction
            )[0][0]
        )

        actual = (
            df.iloc[
                target_index
            ]["modal_price"]
        )

        predicted_prices.append(
            float(prediction)
        )

        actual_prices.append(
            float(actual)
        )

    metrics = calculate_metrics(
        actual_prices,
        predicted_prices
    )

    return {
        "crop": crop,
        "evaluation_method":
            "chronological_rolling_one_step",
        "sequence_length":
            SEQ_LEN,
        "total_rows":
            int(len(df)),
        "evaluation_samples":
            int(len(actual_prices)),
        "date_start":
            str(df.iloc[SEQ_LEN]["date"]),
        "date_end":
            str(df.iloc[-1]["date"]),
        **metrics,
    }


# -------------------------------------------------
# EVALUATE ALL CROPS
# -------------------------------------------------

def evaluate_all_crops():

    results = {}

    print()
    print("=" * 60)
    print("KRISHIMIND MODEL EVALUATION")
    print("=" * 60)

    for crop in CROPS:

        print()
        print(
            f"Evaluating {crop.upper()}..."
        )

        try:

            result = evaluate_crop(crop)

            results[crop] = result

            print(
                f"  Samples : "
                f"{result['evaluation_samples']}"
            )

            print(
                f"  MAE     : "
                f"{result['mae']}"
            )

            print(
                f"  RMSE    : "
                f"{result['rmse']}"
            )

            print(
                f"  MAPE    : "
                f"{result['mape']}%"
            )

        except Exception as e:

            print(
                f"  FAILED: {str(e)}"
            )

            results[crop] = {
                "error": str(e)
            }

    return results


# -------------------------------------------------
# MAIN
# -------------------------------------------------

if __name__ == "__main__":

    results = evaluate_all_crops()

    output_file = os.path.join(
        MODELS_DIR,
        "evaluation_metrics.json"
    )

    with open(
        output_file,
        "w",
        encoding="utf-8"
    ) as f:

        json.dump(
            results,
            f,
            indent=4
        )

    print()
    print("=" * 60)
    print(
        "Evaluation complete."
    )
    print(
        f"Metrics saved to:"
    )
    print(
        output_file
    )
    print("=" * 60)