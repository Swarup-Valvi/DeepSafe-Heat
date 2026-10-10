"""
Random Forest inference for heat risk classification.

The RF was trained to reproduce the rule engine's classification step
(see ml/train_risk_rf.py). It predicts a risk level (LOW/MODERATE/HIGH/
VERY_HIGH) plus a confidence score.

The rule engine is still used for:
    - Numeric risk_score (0-10)
    - Safety recommendation text
    - Explanation breakdown

This hybrid keeps safety recommendations human-curated while letting the
classification adapt to new data.
"""
from pathlib import Path

import joblib
import numpy as np

MODEL_PATH = Path("ml/artifacts/risk_rf.pkl")

INTENSITY_MAP = {"LOW": 0, "MODERATE": 1, "HIGH": 2}

_model = None


def _load():
    global _model
    if _model is None:
        _model = joblib.load(MODEL_PATH)
    return _model


def predict_risk_level(temperature, humidity, wind_speed, uv_index, intensity, duration):
    """
    Predict risk level with the Random Forest.

    Args:
        temperature (float): °C
        humidity (float): %
        wind_speed (float): km/h
        uv_index (float): 0-11+
        intensity (str): 'LOW' | 'MODERATE' | 'HIGH'
        duration (float): hours

    Returns:
        dict with:
            - level: 'LOW' | 'MODERATE' | 'HIGH' | 'VERY_HIGH'
            - confidence: float 0-1
            - probabilities: dict of each class → probability
    """
    model = _load()

    intensity_num = INTENSITY_MAP.get(str(intensity).upper(), 1)
    X = np.array([[
        float(temperature),
        float(humidity),
        float(wind_speed),
        float(uv_index),
        intensity_num,
        float(duration),
    ]], dtype=np.float32)

    proba = model.predict_proba(X)[0]
    classes = model.classes_
    pred_idx = int(np.argmax(proba))

    return {
        "level": str(classes[pred_idx]),
        "confidence": float(proba[pred_idx]),
        "probabilities": {
            str(c): float(p) for c, p in zip(classes, proba)
        },
    }


def is_available() -> bool:
    return MODEL_PATH.exists()
