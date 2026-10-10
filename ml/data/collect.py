import requests
import pandas as pd
from pathlib import Path

CITIES = {
    "mumbai":   (19.07, 72.87),
    "delhi":    (28.61, 77.20),
    "chennai":  (13.08, 80.27),
}

def fetch(lat, lon, start="2020-01-01", end="2025-01-01"):
    url = "https://archive-api.open-meteo.com/v1/archive"
    params = {
        "latitude": lat, "longitude": lon,
        "start_date": start, "end_date": end,
        "hourly": ["temperature_2m", "relative_humidity_2m",
                   "wind_speed_10m", "shortwave_radiation",
                   "surface_pressure", "dew_point_2m"],
        "timezone": "auto"
    }
    r = requests.get(url, params=params)
    r.raise_for_status()
    df = pd.DataFrame(r.json()["hourly"])
    df["time"] = pd.to_datetime(df["time"])
    return df.set_index("time")

if __name__ == "__main__":
    Path("ml/data/raw").mkdir(parents=True, exist_ok=True)
    for name, (lat, lon) in CITIES.items():
        print(f"Fetching {name}...")
        df = fetch(lat, lon)
        df.to_csv(f"ml/data/raw/{name}.csv")
        print(f"  {len(df)} rows saved")