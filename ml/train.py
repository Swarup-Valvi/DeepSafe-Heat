import torch, torch.nn as nn, pandas as pd, numpy as np
from torch.utils.data import DataLoader, random_split
from pathlib import Path
from ml.data.dataset import WindowDataset
from ml.models.lstm import LSTMForecaster

CITY = "mumbai"
EPOCHS = 20
BATCH = 64
LR = 1e-3

def main():
    df = pd.read_csv(f"ml/data/raw/{CITY}.csv",
                     parse_dates=["time"], index_col="time")
    # Chronological split: 80/10/10
    n = len(df)
    train_df = df.iloc[:int(n*0.8)]
    val_df   = df.iloc[int(n*0.8):int(n*0.9)]
    test_df  = df.iloc[int(n*0.9):]

    train_ds = WindowDataset(train_df)
    val_ds   = WindowDataset(val_df)
    test_ds  = WindowDataset(test_df)

    train_loader = DataLoader(train_ds, batch_size=BATCH, shuffle=True)
    val_loader   = DataLoader(val_ds,   batch_size=BATCH)
    test_loader  = DataLoader(test_ds,  batch_size=BATCH)

    n_features = train_ds[0][0].shape[-1]
    model = LSTMForecaster(n_features=n_features)
    opt = torch.optim.Adam(model.parameters(), lr=LR)
    loss_fn = nn.MSELoss()

    best_val = float("inf")
    for epoch in range(EPOCHS):
        model.train()
        train_losses = []
        for x, y in train_loader:
            opt.zero_grad()
            pred = model(x)
            loss = loss_fn(pred, y)
            loss.backward()
            opt.step()
            train_losses.append(loss.item())

        # Validate
        model.eval()
        val_losses = []
        with torch.no_grad():
            for x, y in val_loader:
                val_losses.append(loss_fn(model(x), y).item())

        tr = np.mean(train_losses)
        vl = np.mean(val_losses)
        print(f"Epoch {epoch+1:2d} | train MSE {tr:.3f} | val MSE {vl:.3f} | "
              f"val RMSE {np.sqrt(vl):.3f}°C")

        if vl < best_val:
            best_val = vl
            Path("ml/artifacts").mkdir(exist_ok=True)
            torch.save(model.state_dict(), "ml/artifacts/lstm.pt")

    # Final test eval
    model.load_state_dict(torch.load("ml/artifacts/lstm.pt"))
    model.eval()
    preds, truths = [], []
    with torch.no_grad():
        for x, y in test_loader:
            preds.append(model(x).numpy())
            truths.append(y.numpy())
    preds = np.concatenate(preds)
    truths = np.concatenate(truths)

    mae  = np.mean(np.abs(preds - truths))
    rmse = np.sqrt(np.mean((preds - truths)**2))
    print(f"\nTEST  MAE: {mae:.3f}°C   RMSE: {rmse:.3f}°C")

if __name__ == "__main__":
    main()