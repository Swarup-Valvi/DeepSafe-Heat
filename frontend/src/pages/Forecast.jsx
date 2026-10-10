import { useEffect, useState } from "react";
import {
  Box, Card, CardContent, Typography, CircularProgress,
  Alert, Chip, Stack,
} from "@mui/material";
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  CartesianGrid, ReferenceLine, ResponsiveContainer,
} from "recharts";
import { getForecast } from "../api/forecast";

const ALERT_COLORS = {
  NONE: "success",
  MODERATE: "warning",
  HIGH: "error",
  SEVERE: "error",
};

export default function Forecast() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getForecast()
      .then((d) => setData(d))
      .catch((e) => setError(e?.message || "Failed to load forecast"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  const rows = data.times.map((t, i) => {
    const d = new Date(t);
    return {
      time: `${String(d.getHours()).padStart(2, "0")}:00`,
      temp: data.temperatures[i],
    };
  });

  const alertColor = ALERT_COLORS[data.alert_level] || "default";

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Temperature Forecast (Next 12 Hours)
      </Typography>

      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <Chip
          label={`Alert: ${data.alert_level}`}
          color={alertColor}
          size="medium"
        />
        <Chip
          label={`Max: ${data.max_temp.toFixed(1)} °C`}
          color="primary"
          size="medium"
        />
      </Stack>

      {data.alert_level !== "NONE" && (
        <Alert
          severity={data.alert_level === "SEVERE" ? "error" : "warning"}
          sx={{ mb: 2 }}
        >
          Heatwave risk detected. Recommend rescheduling outdoor activity.
        </Alert>
      )}

      <Card>
        <CardContent>
          <Box sx={{ width: "100%", height: 350 }}>
            <ResponsiveContainer>
              <LineChart data={rows} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis
                  domain={["dataMin - 2", "dataMax + 2"]}
                  label={{ value: "°C", angle: -90, position: "insideLeft" }}
                />
                <Tooltip formatter={(v) => `${v.toFixed(2)} °C`} />
                <ReferenceLine y={37} stroke="orange" strokeDasharray="4 4" label="Moderate" />
                <ReferenceLine y={40} stroke="red" strokeDasharray="4 4" label="High" />
                <ReferenceLine y={45} stroke="darkred" strokeDasharray="4 4" label="Severe" />
                <Line
                  type="monotone"
                  dataKey="temp"
                  stroke="#ff6b00"
                  strokeWidth={3}
                  dot={{ r: 3 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
