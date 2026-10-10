import torch, pandas as pd, numpy as np, requests
from datetime import datetime, timedelta
from rest_framework.views import APIView
from rest_framework.response import Response
from ml.models.lstm import LSTMForecaster
from ml.data.dataset import WindowDataset, FEATURES, add_cyclical
from sklearn.preprocessing import StandardScaler

MODEL_PATH = "ml/artifacts/lstm.pt"
_model = None
_scaler = None

def load_model():
    global _model, _scaler
    if _model is None:
        # Rebuild a scaler from training data
        df = pd.read_csv("ml/data/raw/mumbai.csv",
                         parse_dates=["time"], index_col="time")
        ds = WindowDataset(df)  # this creates a scaler internally
        _scaler = ds.scaler
        n_features = len(ds.cols)
        _model = LSTMForecaster(n_features=n_features)
        _model.load_state_dict(torch.load(MODEL_PATH))
        _model.eval()
    return _model, _scaler

def fetch_recent(lat, lon):
    """Fetch last 48h + next 12h forecast from Open-Meteo."""
    url = "https://api.open-meteo.com/v1/forecast"
    params = {
        "latitude": lat, "longitude": lon,
        "hourly": ["temperature_2m", "relative_humidity_2m",
                   "wind_speed_10m", "shortwave_radiation",
                   "surface_pressure", "dew_point_2m"],
        "past_days": 2, "forecast_days": 1, "timezone": "auto"
    }
    r = requests.get(url, params=params)
    df = pd.DataFrame(r.json()["hourly"])
    df["time"] = pd.to_datetime(df["time"])
    return df.set_index("time")

class ForecastView(APIView):
    def get(self, request):
        lat = float(request.query_params.get("lat", 19.07))
        lon = float(request.query_params.get("lon", 72.87))

        df = fetch_recent(lat, lon)
        df = add_cyclical(df)

        model, scaler = load_model()
        cols = FEATURES + ["hour_sin","hour_cos","doy_sin","doy_cos"]
        x = scaler.transform(df[cols].iloc[-48:].values.astype(np.float32))
        x = torch.from_numpy(x).unsqueeze(0)

        with torch.no_grad():
            pred = model(x).numpy().flatten().tolist()

        now = df.index[-1]
        times = [(now + timedelta(hours=i+1)).isoformat() for i in range(len(pred))]

        max_t = max(pred)
        alert = "NONE"
        if max_t >= 45: alert = "SEVERE"
        elif max_t >= 40: alert = "HIGH"
        elif max_t >= 37: alert = "MODERATE"

        return Response({
            "times": times,
            "temperatures": pred,
            "max_temp": max_t,
            "alert_level": alert
        })