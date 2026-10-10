import torch, pandas as pd, numpy as np, requests
from datetime import timedelta
from rest_framework.views import APIView
from rest_framework.response import Response
from sklearn.preprocessing import StandardScaler
from ml.models.lstm import LSTMForecaster
from rest_framework.permissions import AllowAny
from ml.data.dataset import FEATURES, add_cyclical

MODEL_PATH = "ml/artifacts/lstm.pt"
_model = None

def load_model():
    global _model
    if _model is None:
        df = pd.read_csv("ml/data/raw/mumbai.csv",
                         parse_dates=["time"], index_col="time")
        df_c = add_cyclical(df)
        cols = FEATURES + ["hour_sin","hour_cos","doy_sin","doy_cos"]
        scaler = StandardScaler().fit(df_c[cols].values.astype(np.float32))

        _model = LSTMForecaster(n_features=len(cols))
        _model.load_state_dict(torch.load(MODEL_PATH, map_location="cpu"))
        _model.eval()
        _model._scaler = scaler
        _model._cols = cols
    return _model

def fetch_recent(lat, lon):
    url = "https://api.open-meteo.com/v1/forecast"
    params = {
        "latitude": lat, "longitude": lon,
        "hourly": FEATURES,
        "past_days": 2, "forecast_days": 1, "timezone": "auto"
    }
    r = requests.get(url, params=params)
    r.raise_for_status()
    df = pd.DataFrame(r.json()["hourly"])
    df["time"] = pd.to_datetime(df["time"])
    return df.set_index("time")

class ForecastView(APIView):
    permission_classes = [AllowAny]
    def get(self, request):
        lat = float(request.query_params.get("lat", 19.07))
        lon = float(request.query_params.get("lon", 72.87))

        try:
            df = fetch_recent(lat, lon)
        except Exception as e:
            return Response({"error": f"weather fetch failed: {e}"}, status=502)

        df_c = add_cyclical(df)
        model = load_model()

        x = model._scaler.transform(
                df_c[model._cols].iloc[-48:].values.astype(np.float32))
        x = torch.from_numpy(x).unsqueeze(0).float()

        with torch.no_grad():
            pred = model(x).numpy().flatten().tolist()

        now = df.index[-1]
        times = [(now + timedelta(hours=i+1)).isoformat() for i in range(len(pred))]

        max_t = max(pred)
        if   max_t >= 45: alert = "SEVERE"
        elif max_t >= 40: alert = "HIGH"
        elif max_t >= 37: alert = "MODERATE"
        else:             alert = "NONE"

        return Response({
            "times": times,
            "temperatures": [round(t, 2) for t in pred],
            "max_temp": round(max_t, 2),
            "alert_level": alert
        })
