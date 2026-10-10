import {
    Navigate,
    useLocation,
    useNavigate,
  } from "react-router-dom";
  
  import {
    Box,
    Button,
    Divider,
    Grid,
    LinearProgress,
    Paper,
    Stack,
    Typography,
  } from "@mui/material";
  
  import ThermostatRoundedIcon from
    "@mui/icons-material/ThermostatRounded";
  import WaterDropOutlinedIcon from
    "@mui/icons-material/WaterDropOutlined";
  import AirRoundedIcon from
    "@mui/icons-material/AirRounded";
  import WbSunnyOutlinedIcon from
    "@mui/icons-material/WbSunnyOutlined";
  import AccessTimeRoundedIcon from
    "@mui/icons-material/AccessTimeRounded";
  
  import { useState } from "react";

  import SmartToyRoundedIcon from
    "@mui/icons-material/SmartToyRounded";

  import {
    Alert as MuiAlert,
    Chip,
    CircularProgress,
  } from "@mui/material";

  import {
    assessActivityDL,
  } from "../api/activities";

  import RiskGauge from
    "../components/dashboard/RiskGauge";
  
  import RiskBadge from
    "../components/dashboard/RiskBadge";
  
  import SectionCard from
    "../components/dashboard/SectionCard";
  
  
  function formatTime(value) {
    if (!value) {
      return "—";
    }
  
    const [hours, minutes] =
      value.split(":");
  
    const date = new Date();
  
    date.setHours(
      Number(hours),
      Number(minutes),
      0,
      0
    );
  
    return date.toLocaleTimeString(
      "en-IN",
      {
        hour: "numeric",
        minute: "2-digit",
      }
    );
  }
  
  
  export default function AssessmentResultsPage() {
    const navigate = useNavigate();
    const location = useLocation();

    const [dlResult, setDlResult] = useState(null);
    const [dlLoading, setDlLoading] = useState(false);
    const [dlError, setDlError] = useState(null);

    const handleAssessDL = async () => {
      setDlLoading(true);
      setDlError(null);
      try {
        const data = await assessActivityDL(
          result.activity.id
        );
        setDlResult(data);
      } catch (err) {
        setDlError(
          err?.response?.data?.detail ||
          err?.message ||
          "Deep learning assessment failed."
        );
      } finally {
        setDlLoading(false);
      }
    };
  
    const result =
      location.state?.result;
  
    if (!result) {
      return (
        <Navigate
          to="/supervisor/history"
          replace
        />
      );
    }
  
    const {
      activity,
      weather,
      assessment,
    } = result;
  
    const score =
      Number(
        assessment.risk_score
      ) || 0;
  
    const explanation =
      assessment.explanation || {};
  
    const scores =
      explanation.scores || {};
  
    const factors = [
      {
        label: "Temperature",
        value:
          Number(scores.temperature) ||
          0,
      },
      {
        label: "Humidity",
        value:
          Number(scores.humidity) ||
          0,
      },
      {
        label: "UV exposure",
        value:
          Number(scores.uv) || 0,
      },
      {
        label: "Activity intensity",
        value:
          Number(scores.activity) ||
          0,
      },
      {
        label: "Duration",
        value:
          Number(scores.duration) ||
          0,
      },
    ];
  
  
    return (
      <Box>
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="h4"
            fontWeight={800}
          >
            Assessment Results
          </Typography>
  
          <Typography
            color="text.secondary"
            variant="body2"
          >
            HeatSafe retrieved the expected
            weather and calculated the risk
            for this activity.
          </Typography>
        </Box>
  
        <Grid
          container
          spacing={2.5}
        >
          <Grid
            size={{
              xs: 12,
              lg: 7,
            }}
          >
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3,
              }}
            >
              <Grid
                container
                spacing={3}
              >
                <Grid
                  size={{
                    xs: 12,
                    md: 4,
                  }}
                >
                  <Stack
                    sx={{
                      alignItems:
                        "center",
                      justifyContent:
                        "center",
                      minHeight: 240,
                    }}
                  >
                    <RiskGauge
                      score={score}
                      size={150}
                    />
  
                    <Box sx={{ mt: 2 }}>
                      <RiskBadge
                        level={
                          assessment.risk_level
                        }
                      />
                    </Box>
  
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      textAlign="center"
                      sx={{
                        mt: 1.25,
                        maxWidth: 240,
                      }}
                    >
                      {
                        assessment.recommendation
                      }
                    </Typography>
                  </Stack>
                </Grid>
  
                <Grid
                  size={{
                    xs: 12,
                    md: 8,
                  }}
                >
                  <Typography
                    fontWeight={800}
                    sx={{ mb: 2 }}
                  >
                    Risk Factor Breakdown
                  </Typography>
  
                  <Stack spacing={2}>
                    {factors.map(
                      (factor) => {
                        const percentage =
                          Math.min(
                            factor.value *
                              10,
                            100
                          );
  
                        return (
                          <Box
                            key={
                              factor.label
                            }
                          >
                            <Stack
                              direction="row"
                              sx={{
                                justifyContent:
                                  "space-between",
                                mb: 0.75,
                              }}
                            >
                              <Typography variant="body2">
                                {
                                  factor.label
                                }
                              </Typography>
  
                              <Typography
                                variant="body2"
                                fontWeight={750}
                              >
                                {
                                  factor.value
                                }{" "}
                                / 10
                              </Typography>
                            </Stack>
  
                            <LinearProgress
                              variant="determinate"
                              value={
                                percentage
                              }
                              sx={{
                                height: 7,
                                borderRadius:
                                  10,
                              }}
                            />
                          </Box>
                        );
                      }
                    )}
                  </Stack>
                </Grid>
              </Grid>
  
              <Divider sx={{ my: 3 }} />
  
              <Grid
                container
                spacing={2}
              >
                <WeatherMetric
                  icon={
                    <ThermostatRoundedIcon />
                  }
                  label="Temperature"
                  value={`${weather.temperature}°C`}
                />
  
                <WeatherMetric
                  icon={
                    <ThermostatRoundedIcon />
                  }
                  label="Feels like"
                  value={`${weather.feels_like}°C`}
                />
  
                <WeatherMetric
                  icon={
                    <WaterDropOutlinedIcon />
                  }
                  label="Humidity"
                  value={`${weather.humidity}%`}
                />
  
                <WeatherMetric
                  icon={
                    <AirRoundedIcon />
                  }
                  label="Wind"
                  value={`${weather.wind_speed} km/h`}
                />
  
                <WeatherMetric
                  icon={
                    <WbSunnyOutlinedIcon />
                  }
                  label="UV Index"
                  value={
                    weather.uv_index
                  }
                />
              </Grid>
            </Paper>
          </Grid>
  
          <Grid
            size={{
              xs: 12,
              lg: 5,
            }}
          >
            <Stack spacing={2.5}>
              <SectionCard title="Activity Summary">
                <Stack spacing={1.5}>
                  <SummaryRow
                    label="Activity"
                    value={
                      activity.activity_type_name
                    }
                  />
  
                  <SummaryRow
                    label="Location"
                    value={
                      activity.location
                    }
                  />
  
                  <SummaryRow
                    label="Date"
                    value={
                      activity.activity_date
                    }
                  />
  
                  <SummaryRow
                    label="Start time"
                    value={formatTime(
                      activity.start_time
                    )}
                  />
  
                  <SummaryRow
                    label="Duration"
                    value={`${activity.duration_hours} hours`}
                  />
  
                  <SummaryRow
                    label="Intensity"
                    value={
                      activity.activity_intensity
                    }
                  />
  
                  <SummaryRow
                    label="Risk level"
                    value={
                      <RiskBadge
                        level={
                          assessment.risk_level
                        }
                      />
                    }
                  />
                </Stack>
              </SectionCard>
  
              <SectionCard title="Recommendation">
                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  {
                    assessment.recommendation
                  }
                </Typography>
  
                <Box
                  sx={{
                    mt: 2,
                    p: 2,
                    bgcolor: "#EAF8F1",
                    borderRadius: 2,
                  }}
                >
                  <Stack
                    direction="row"
                    spacing={1.25}
                    sx={{
                      alignItems:
                        "center",
                    }}
                  >
                    <AccessTimeRoundedIcon color="success" />
  
                    <Box>
                      <Typography
                        variant="body2"
                        fontWeight={800}
                      >
                        Safer time
                      </Typography>
  
                      <Typography
                        variant="body2"
                        color="text.secondary"
                      >
                        {formatTime(
                          assessment.safer_start_time
                        )}
                        {" – "}
                        {formatTime(
                          assessment.safer_end_time
                        )}
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
  
                <Button
                  fullWidth
                  variant="outlined"
                  sx={{ mt: 2 }}
                  onClick={() =>
                    navigate(
                      "/supervisor/safer-time",
                      {
                        state: {
                          result,
                        },
                      }
                    )
                  }
                >
                  View Safer Times
                </Button>
              </SectionCard>
            </Stack>
          </Grid>
        </Grid>
  
        <Stack
          direction={{
            xs: "column-reverse",
            sm: "row",
          }}
          spacing={1.5}
          sx={{
            mt: 3,
            justifyContent:
              "flex-end",
          }}
        >
          <Button
            variant="outlined"
            onClick={() =>
              navigate(
                "/supervisor/history"
              )
            }
          >
            Activity History
          </Button>
  
          <Button
            variant="contained"
            onClick={() =>
              navigate(
                `/supervisor/history/${activity.id}`,
                {
                  state: {
                    result,
                  },
                }
              )
            }
          >
            View Activity
          </Button>
          {/* AI panel removed — /assess/ now uses DL by default */}
        </Stack>
      </Box>
    );
  }
  
  
  function WeatherMetric({
    icon,
    label,
    value,
  }) {
    return (
      <Grid
        size={{
          xs: 6,
          sm: 4,
          md: 2.4,
        }}
      >
        <Stack
          spacing={0.5}
          sx={{
            alignItems: "center",
            textAlign: "center",
          }}
        >
          <Box
            sx={{
              color: "primary.main",
              display: "flex",
            }}
          >
            {icon}
          </Box>
  
          <Typography
            variant="caption"
            color="text.secondary"
          >
            {label}
          </Typography>
  
          <Typography
            variant="body2"
            fontWeight={800}
          >
            {value}
          </Typography>
        </Stack>
      </Grid>
    );
  }
  
  
  function SummaryRow({
    label,
    value,
  }) {
    return (
      <Stack
        direction="row"
        spacing={2}
        sx={{
          justifyContent:
            "space-between",
          alignItems: "center",
        }}
      >
        <Typography
          variant="body2"
          color="text.secondary"
        >
          {label}
        </Typography>
  
        {typeof value ===
        "string" ? (
          <Typography
            variant="body2"
            fontWeight={750}
            textAlign="right"
          >
            {value}
          </Typography>
        ) : (
          value
        )}
      </Stack>
    );
  }