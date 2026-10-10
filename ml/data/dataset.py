import numpy as np
import pandas as pd
import torch
from torch.utils.data import Dataset
from sklearn.preprocessing import StandardScaler

FEATURES = ["temperature_2m", "relative_humidity_2m", "wind_speed_10m",
            "shortwave_radiation", "surface_pressure", "dew_point_2m"]

def add_cyclical(df):
    """Add sin/cos of hour and day-of-year so model knows time of day."""
    df = df.copy()
    hour = df.index.hour
    doy  = df.index.dayofyear
    df["hour_sin"]  = np.sin(2*np.pi*hour/24)
    df["hour_cos"]  = np.cos(2*np.pi*hour/24)
    df["doy_sin"]   = np.sin(2*np.pi*doy/365)
    df["doy_cos"]   = np.cos(2*np.pi*doy/365)
    return df

class WindowDataset(Dataset):
    def __init__(self, df, input_len=48, horizon=12, target="temperature_2m"):
        df = add_cyclical(df)
        self.cols = FEATURES + ["hour_sin","hour_cos","doy_sin","doy_cos"]
        data = df[self.cols].values.astype(np.float32)

        # Scale features
        self.scaler = StandardScaler()
        data = self.scaler.fit_transform(data)

        # Target = raw temperature (unscaled) for interpretable loss
        target_idx = self.cols.index(target)
        self.target_scaled_idx = target_idx
        self.raw_target = df[target].values.astype(np.float32)

        self.input_len = input_len
        self.horizon = horizon
        self.data = data

    def __len__(self):
        return len(self.data) - self.input_len - self.horizon + 1

    def __getitem__(self, i):
        x = self.data[i : i + self.input_len]              # (48, F)
        y = self.raw_target[i + self.input_len :
                            i + self.input_len + self.horizon]  # (12,)
        return torch.from_numpy(x), torch.from_numpy(y)