# ml/config.py
import os

BASE_DIR   = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_RAW   = os.path.join(BASE_DIR, "data", "raw")
DATA_PROC  = os.path.join(BASE_DIR, "data", "processed")
MODELS_DIR = os.path.join(BASE_DIR, "models")

CONFIG = {

    "crops": ["tomato", "onion", "potato", "wheat", "rice"],

    # sequence
    "seq_len": 30,
    "test_split": 0.15,
    "val_split": 0.10,

    # model architecture
    "lstm_units_1": 160,
    "lstm_units_2": 80,
    "dense_units": 32,
    "dropout_rate": 0.2,

    # training
    "epochs": 250,
    "batch_size": 32,
    "learning_rate": 0.005,
    "patience": 20,
    "min_delta": 0.0001,

    # evaluation
    "target_mape": 10.0,

    # feature columns
    "feature_cols": [

        "price_lag_1",
        "price_lag_3",
        "price_lag_7",
        "price_lag_14",
        "price_lag_30",
        "price_lag_60",     # NEW FEATURE

        "rolling_mean_7",
        "rolling_mean_14",
        "rolling_std_7",

        "arrivals_mt",
        "weekly_arrival_change",

        "day_of_week",
        "month",
        "quarter",
    ],
}