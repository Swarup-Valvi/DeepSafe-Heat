import {
    Box,
    CircularProgress,
    Typography,
  } from "@mui/material";
  
  export default function RiskGauge({
    score = 7.8,
    size = 100,
  }) {
    const percentage = Math.min(
      Math.max(score * 10, 0),
      100
    );
  
    return (
      <Box
        sx={{
          position: "relative",
          width: size,
          height: size,
          display: "inline-flex",
        }}
      >
        <CircularProgress
          variant="determinate"
          value={100}
          size={size}
          thickness={4}
          sx={{
            color: "#F1F2F5",
            position: "absolute",
          }}
        />
  
        <CircularProgress
          variant="determinate"
          value={percentage}
          size={size}
          thickness={4}
          sx={{
            color: "#F4511E",
            transform: "rotate(-90deg)",
          }}
        />
  
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            display: "grid",
            placeItems: "center",
            textAlign: "center",
          }}
        >
          <Box>
            <Typography
              variant="h5"
              fontWeight={800}
              color="primary.main"
              sx={{ lineHeight: 1 }}
            >
              {score}
            </Typography>
  
            <Typography
              variant="caption"
              color="text.secondary"
            >
              /10
            </Typography>
          </Box>
        </Box>
      </Box>
    );
  }