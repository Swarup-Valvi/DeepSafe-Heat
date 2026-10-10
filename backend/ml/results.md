# DeepSafe-Heat — Results

## City: Mumbai | 5 years hourly | input=48h, horizon=12h

| Model | MAE (°C) | RMSE (°C) |
|---|---|---|
| Persistence  | 2.432 | 3.452 |
| Climatology  | 1.388 | 1.771 |
| LSTM (ours)  | 0.663 | 0.884 |

## Training config
- hidden=64, layers=2, dropout=0.2
- batch=64, lr=1e-3, epochs=20
- Chronological split 80/10/10
- Features: temp, RH, wind, solar, pressure, dewpoint + cyclical hour/DOY
