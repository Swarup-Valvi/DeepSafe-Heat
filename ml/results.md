cat > ml/results.md << 'EOF'
# DeepSafe-Heat — Results

## City: Mumbai | 5 years hourly | input=48h, horizon=12h

| Model | MAE (°C) | RMSE (°C) |
|---|---|---|
| LSTM (ours) | 0.663 | 0.884 |
| Persistence | TBD | TBD |
| Climatology | TBD | TBD |

## Training config
- hidden=64, layers=2, dropout=0.2
- batch=64, lr=1e-3, epochs=20
- Chronological split 80/10/10
- Features: temp, RH, wind, solar, pressure, dewpoint + cyclical hour/DOY
EOF