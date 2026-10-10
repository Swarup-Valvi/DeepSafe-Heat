import numpy as np, pandas as pd
from ml.data.dataset import WindowDataset

def persistence_mae(df, input_len=48, horizon=12):
    """Predict: future = last observed temperature."""
    ds = WindowDataset(df, input_len, horizon)
    errs = []
    for i in range(len(ds)):
        _, y = ds[i]
        last = ds.raw_target[i + input_len - 1]
        errs.append(np.abs(y.numpy() - last))
    errs = np.concatenate(errs)
    return errs.mean(), np.sqrt((errs**2).mean())

def climatology_mae(df, input_len=48, horizon=12):
    """Predict: future = historical avg for this hour-of-day."""
    ds = WindowDataset(df, input_len, horizon)
    target = ds.raw_target
    hours = df.index.hour.values
    hourly_mean = pd.Series(target).groupby(hours).mean().values
    errs = []
    for i in range(len(ds)):
        start = i + input_len
        future_hours = hours[start : start + horizon]
        pred = hourly_mean[future_hours]
        truth = target[start : start + horizon]
        errs.append(np.abs(pred - truth))
    errs = np.concatenate(errs)
    return errs.mean(), np.sqrt((errs**2).mean())

if __name__ == "__main__":
    df = pd.read_csv("ml/data/raw/mumbai.csv",
                     parse_dates=["time"], index_col="time")
    test_df = df.iloc[int(len(df)*0.9):]

    p_mae, p_rmse = persistence_mae(test_df)
    c_mae, c_rmse = climatology_mae(test_df)

    print(f"Persistence  | MAE {p_mae:.3f} C | RMSE {p_rmse:.3f} C")
    print(f"Climatology  | MAE {c_mae:.3f} C | RMSE {c_rmse:.3f} C")
    print(f"LSTM (ours)  | MAE 0.663 C | RMSE 0.884 C")
