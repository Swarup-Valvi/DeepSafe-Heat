import { Chip } from "@mui/material";

const styles = {
  LOW: {
    label: "Low",
    color: "#16875D",
    background: "#E8F7EF",
  },
  MODERATE: {
    label: "Moderate",
    color: "#B77900",
    background: "#FFF5D6",
  },
  HIGH: {
    label: "High",
    color: "#D44A15",
    background: "#FFF0E8",
  },
  VERY_HIGH: {
    label: "Very High",
    color: "#D92D20",
    background: "#FEEDEC",
  },
};

export default function RiskBadge({
  level = "LOW",
  size = "small",
}) {
  const config = styles[level] || styles.LOW;

  return (
    <Chip
      label={config.label}
      size={size}
      sx={{
        color: config.color,
        bgcolor: config.background,
        borderRadius: 1.5,
        fontWeight: 700,
      }}
    />
  );
}