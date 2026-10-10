import numpy as np, pandas as pd
from ml.data.dataset import WindowDataset

def persistence(df, input_len=48, horizon=12):
    """Predict: future = last observed temperature."""
    ds = WindowDataset(df, input_len, horizon)
    errs = []
    for i in range(len(ds)):
        _, y = ds[i]
        last = y_last = ds.raw_target[i + input_len - 1]
        errs.append(np.abs(y.numpy() - last))
    errs = np.concatenate(errs)
    return errs.mean()

if __name__ == "__main__":
    df = pd.read_csv("ml/data/raw/mumbai.csv",
                     parse_dates=["time"], index_col="time")
    test_df = df.iloc[int(len(df)*0.9):]
    print(f"Persistence MAE: {persistence(test_df):.3f}°C")