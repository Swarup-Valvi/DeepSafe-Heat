"""
DeepSafe-Heat inference module.

Loads the trained LSTM once and exposes predict_weather_at(lat, lon, target_time)
returning a dict compatible with risk_engine.services.risk_calculator.calculate_risk.
"""
import torch
import pandas as pd
import numpy as np
import requests
from datetime import timedelta
from pathlib import Path
from sklearn.preprocessing import StandardScaler

from ml.models.lstm import LSTMForecaster
from ml.data.dataset import FEATURES, add_cyclical

MODEL_PATH = Path("ml/artifacts/lstm.pt")
TRAIN_CSV = Path("ml/data/raw/mumbai.csv")   # used to fit the scaler

# Model constants — must match training
INPUT_LEN = 48
HORIZON = 12
COLS = FEATURES + ["hour_sin", "hour_cos", "doy_sin", "doy_cos"]

_model = None
_scaler = None


def _load():
    global _model, _scaler
    if _model is not None:
        return

    df = pd.read_csv(TRAIN_CSV, parse_dates=["time"], index_col="time")
    df_c = add_cyclical(df)
    _scaler = StandardScaler().fit(df_c[COLS].values.astype(np.float32))

    _model = LSTMForecaster(n_features=len(COLS))
    _model.load_state_dict(torch.load(MODEL_PATH, map_location="cpu"))
    _model.eval()


def _fetch_recent(lat, lon):
    """Get last 48h of hourly weather (input window for the model)."""
    url = "https://api.open-meteo.com/v1/forecast"
    params = {
        "latitude": lat,
        "longitude": lon,
        "hourly": FEATURES,
        "past_days": 2,
        "forecast_days": 1,
        "timezone": "auto",
    }
    r = requests.get(url, params=params, timeout=10)
    r.raise_for_status()
    df = pd.DataFrame(r.json()["hourly"])
    df["time"] = pd.to_datetime(df["time"])
    return df.set_index("time")


def predict_weather_at(lat, lon, target_time):
    """
    Predict weather conditions at target_time using the trained LSTM.

    Args:
        lat, lon: float
        target_time: timezone-aware datetime

    Returns:
        dict with keys: temperature, humidity, wind_speed, uv_index,
                        feels_like, forecast_time
    Raises:
        RuntimeError if target is outside the 12-hour prediction horizon.
    """
    _load()

    df = _fetch_recent(lat, lon)
    df_c = add_cyclical(df)

    # Anchor = current hour in the location's local timezone.
    # Open-Meteo returns naive local timestamps.
    anchor = pd.Timestamp.now().floor("h").tz_localize(None)

    # Strip tz from target_time to match naive anchor.
    if hasattr(target_time, "tzinfo") and target_time.tzinfo is not None:
        target_time = target_time.astimezone().replace(tzinfo=None)

    hours_ahead = round((target_time - anchor).total_seconds() / 3600)

    # Clamp to model horizon so out-of-range inputs don't crash the API.
    if hours_ahead < 1:
        hours_ahead = 1
    if hours_ahead > HORIZON:
        hours_ahead = HORIZON

    # Use the 48 hours ending at the anchor (i.e., observed past) as model input.
    hist = df_c[df_c.index <= anchor]
    if len(hist) < INPUT_LEN:
        hist = df_c.iloc[:INPUT_LEN]  # fallback if not enough history
    window = hist[COLS].iloc[-INPUT_LEN:].values.astype(np.float32)
    x = _scaler.transform(window)
    x = torch.from_numpy(x).unsqueeze(0).float()

    with torch.no_grad():
        preds = _model(x).numpy().flatten().tolist()

    pred_temp = float(preds[hours_ahead - 1])

    # Use last observed humidity/wind as proxies (we only model temperature).
    # In a future iteration, add multi-output LSTM for these too.
    last = df.iloc[-1]
    humidity = float(last["relative_humidity_2m"])
    wind_speed = float(last["wind_speed_10m"])

    # Simple heat index approximation (Rothfusz-style) for feels_like
    T = pred_temp
    RH = humidity
    if T >= 27:
        feels_like = (
            -8.784695
            + 1.61139411 * T
            + 2.338549 * RH
            - 0.14611605 * T * RH
            - 0.012308094 * T * T
            - 0.016424828 * RH * RH
            + 0.002211732 * T * T * RH
            + 0.00072546 * T * RH * RH
            - 0.000003582 * T * T * RH * RH
        )
    else:
        feels_like = T

    # Crude UV proxy from time-of-day (peak at noon)
    hour = target_time.hour
    uv_index = max(0.0, 10.0 * np.sin(np.pi * (hour - 6) / 12)) if 6 <= hour <= 18 else 0.0

    return {
        "temperature": round(pred_temp, 2),
        "feels_like": round(feels_like, 2),
        "humidity": round(humidity, 1),
        "wind_speed": round(wind_speed, 1),
        "uv_index": round(uv_index, 1),
        "forecast_time": target_time.isoformat(),
        "hours_ahead": hours_ahead,
    }
