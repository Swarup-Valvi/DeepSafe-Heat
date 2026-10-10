import {
    useEffect,
    useMemo,
    useState,
  } from "react";
  
  import {
    Alert,
    Box,
    CircularProgress,
    Grid,
    MenuItem,
    Paper,
    Stack,
    TextField,
    Typography,
  } from "@mui/material";
  
  import ThermostatRoundedIcon from
    "@mui/icons-material/ThermostatRounded";
  
  import WaterDropOutlinedIcon from
    "@mui/icons-material/WaterDropOutlined";
  
  import AirRoundedIcon from
    "@mui/icons-material/AirRounded";
  
  import WbSunnyRoundedIcon from
    "@mui/icons-material/WbSunnyRounded";
  
  import AccessTimeRoundedIcon from
    "@mui/icons-material/AccessTimeRounded";
  
  import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
  } from "recharts";
  
  import RiskBadge from
    "../components/dashboard/RiskBadge";
  
  import SectionCard from
    "../components/dashboard/SectionCard";
  
  import {
    getActivities,
    getSaferTimes,
  } from "../api/activities";
  
  
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
  
  
  function formatWindow(
    start,
    end
  ) {
    return `${formatTime(
      start
    )} – ${formatTime(end)}`;
  }
  
  
  export default function WeatherForecastPage() {
    const [activities, setActivities] =
      useState([]);
  
    const [
      selectedActivityId,
      setSelectedActivityId,
    ] = useState("");
  
    const [forecast, setForecast] =
      useState(null);
  
    const [loadingActivities, setLoadingActivities] =
      useState(true);
  
    const [loadingForecast, setLoadingForecast] =
      useState(false);
  
    const [error, setError] =
      useState("");
  
  
    useEffect(() => {
      const loadActivities = async () => {
        try {
          setLoadingActivities(true);
          setError("");
  
          const data =
            await getActivities();
  
          setActivities(data);
  
          if (data.length > 0) {
            setSelectedActivityId(
              String(data[0].id)
            );
          }
        } catch (err) {
          console.error(err);
  
          setError(
            "Unable to load activities."
          );
        } finally {
          setLoadingActivities(false);
        }
      };
  
      loadActivities();
    }, []);
  
  
    useEffect(() => {
      if (!selectedActivityId) {
        setForecast(null);
        return;
      }
  
      const loadForecast =
        async () => {
          try {
            setLoadingForecast(true);
            setError("");
  
            const data =
              await getSaferTimes(
                selectedActivityId
              );
  
            setForecast(data);
          } catch (err) {
            console.error(err);
  
            setForecast(null);
  
            setError(
              err.response?.data?.detail ||
                "Unable to load forecast for this activity."
            );
          } finally {
            setLoadingForecast(false);
          }
        };
  
      loadForecast();
    }, [selectedActivityId]);
  
  
    const selectedActivity =
      useMemo(() => {
        return activities.find(
          (activity) =>
            String(activity.id) ===
            String(
              selectedActivityId
            )
        );
      }, [
        activities,
        selectedActivityId,
      ]);
  
  
    const slots =
      forecast?.slots || [];
  
  
    const bestSlot =
      slots.length > 0
        ? slots[0]
        : null;
  
  
    const chartData =
      slots
        .slice()
        .sort(
          (first, second) =>
            first.start_time.localeCompare(
              second.start_time
            )
        )
        .map((slot) => ({
          time:
            formatTime(
              slot.start_time
            ),
  
          temperature:
            Number(
              slot.temperature
            ),
  
          risk:
            Number(
              slot.risk_score
            ),
        }));
  
  
    if (loadingActivities) {
      return (
        <Box
          sx={{
            py: 10,
            display: "flex",
            justifyContent:
              "center",
          }}
        >
          <CircularProgress />
        </Box>
      );
    }
  
  
    return (
      <Box>
        <Stack
          direction={{
            xs: "column",
            md: "row",
          }}
          spacing={2}
          sx={{
            justifyContent:
              "space-between",
  
            alignItems: {
              xs: "flex-start",
              md: "center",
            },
  
            mb: 3,
          }}
        >
          <Box>
            <Typography
              variant="h4"
              fontWeight={800}
            >
              Weather Forecast
            </Typography>
  
            <Typography
              variant="body2"
              color="text.secondary"
            >
              Compare forecast conditions
              and heat risk for your
              planned activities.
            </Typography>
          </Box>
  
          <TextField
            select
            label="Activity"
            value={
              selectedActivityId
            }
            onChange={(event) =>
              setSelectedActivityId(
                event.target.value
              )
            }
            sx={{
              minWidth: {
                xs: "100%",
                sm: 300,
              },
            }}
          >
            {activities.map(
              (activity) => (
                <MenuItem
                  key={activity.id}
                  value={String(
                    activity.id
                  )}
                >
                  {
                    activity.activity_type_name
                  }{" "}
                  · {activity.location} ·{" "}
                  {
                    activity.activity_date
                  }
                </MenuItem>
              )
            )}
          </TextField>
        </Stack>
  
  
        {error && (
          <Alert
            severity="error"
            sx={{ mb: 2 }}
          >
            {error}
          </Alert>
        )}
  
  
        {!activities.length ? (
          <Alert severity="info">
            Plan an activity first to
            view forecast conditions.
          </Alert>
        ) : loadingForecast ? (
          <Paper
            elevation={0}
            sx={{
              py: 10,
              borderRadius: 3,
            }}
          >
            <Stack
              spacing={2}
              sx={{
                alignItems: "center",
              }}
            >
              <CircularProgress />
  
              <Typography
                variant="body2"
                color="text.secondary"
              >
                Loading forecast...
              </Typography>
            </Stack>
          </Paper>
        ) : (
          <>
            {selectedActivity && (
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  borderRadius: 3,
                  mb: 2.5,
                }}
              >
                <Stack
                  direction={{
                    xs: "column",
                    md: "row",
                  }}
                  spacing={3}
                  sx={{
                    justifyContent:
                      "space-between",
                  }}
                >
                  <Meta
                    label="Activity"
                    value={
                      selectedActivity
                        .activity_type_name
                    }
                  />
  
                  <Meta
                    label="Location"
                    value={
                      selectedActivity
                        .location
                    }
                  />
  
                  <Meta
                    label="Date"
                    value={
                      selectedActivity
                        .activity_date
                    }
                  />
  
                  <Meta
                    label="Current start"
                    value={formatTime(
                      selectedActivity
                        .start_time
                    )}
                  />
  
                  <Meta
                    label="Duration"
                    value={`${selectedActivity.duration_hours} hours`}
                  />
                </Stack>
              </Paper>
            )}
  
  
            {bestSlot && (
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  mb: 2.5,
                  borderRadius: 3,
                  bgcolor: "#EAF8F1",
                }}
              >
                <Stack
                  direction={{
                    xs: "column",
                    sm: "row",
                  }}
                  spacing={2}
                  sx={{
                    justifyContent:
                      "space-between",
  
                    alignItems: {
                      xs: "flex-start",
                      sm: "center",
                    },
                  }}
                >
                  <Stack
                    direction="row"
                    spacing={1.5}
                    sx={{
                      alignItems:
                        "center",
                    }}
                  >
                    <AccessTimeRoundedIcon
                      color="success"
                    />
  
                    <Box>
                      <Typography
                        fontWeight={800}
                      >
                        Best forecast window
                      </Typography>
  
                      <Typography
                        variant="body2"
                        color="text.secondary"
                      >
                        {formatWindow(
                          bestSlot.start_time,
                          bestSlot.end_time
                        )}
                      </Typography>
                    </Box>
                  </Stack>
  
                  <Stack
                    direction="row"
                    spacing={2}
                    sx={{
                      alignItems:
                        "center",
                    }}
                  >
                    <Typography
                      fontWeight={800}
                    >
                      {
                        bestSlot.risk_score
                      }{" "}
                      / 10
                    </Typography>
  
                    <RiskBadge
                      level={
                        bestSlot.risk_level
                      }
                    />
                  </Stack>
                </Stack>
              </Paper>
            )}
  
  
            <Grid
              container
              spacing={2}
              sx={{ mb: 2.5 }}
            >
              {slots.map((slot) => (
                <Grid
                  key={
                    slot.start_time
                  }
                  size={{
                    xs: 12,
                    sm: 6,
                    md: 4,
                    lg: 3,
                  }}
                >
                  <ForecastCard
                    slot={slot}
                  />
                </Grid>
              ))}
            </Grid>
  
  
            <Grid
              container
              spacing={2.5}
            >
              <Grid
                size={{
                  xs: 12,
                  lg: 8,
                }}
              >
                <SectionCard title="Temperature Trend">
                  {chartData.length ? (
                    <Box
                      sx={{
                        height: 290,
                      }}
                    >
                      <ResponsiveContainer
                        width="100%"
                        height="100%"
                      >
                        <AreaChart
                          data={
                            chartData
                          }
                        >
                          <defs>
                            <linearGradient
                              id="forecastTemperature"
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="5%"
                                stopColor="#F4511E"
                                stopOpacity={
                                  0.3
                                }
                              />
  
                              <stop
                                offset="95%"
                                stopColor="#F4511E"
                                stopOpacity={
                                  0
                                }
                              />
                            </linearGradient>
                          </defs>
  
                          <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={
                              false
                            }
                          />
  
                          <XAxis
                            dataKey="time"
                            axisLine={
                              false
                            }
                            tickLine={
                              false
                            }
                          />
  
                          <YAxis
                            axisLine={
                              false
                            }
                            tickLine={
                              false
                            }
                            unit="°"
                          />
  
                          <Tooltip />
  
                          <Area
                            type="monotone"
                            dataKey="temperature"
                            name="Temperature"
                            stroke="#F4511E"
                            fill="url(#forecastTemperature)"
                            strokeWidth={
                              3
                            }
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </Box>
                  ) : (
                    <Typography
                      color="text.secondary"
                    >
                      No forecast data
                      available.
                    </Typography>
                  )}
                </SectionCard>
              </Grid>
  
  
              <Grid
                size={{
                  xs: 12,
                  lg: 4,
                }}
              >
                <SectionCard title="Best Window Conditions">
                  {bestSlot ? (
                    <Stack spacing={2}>
                      <SummaryMetric
                        icon={
                          <ThermostatRoundedIcon />
                        }
                        label="Temperature"
                        value={`${bestSlot.temperature}°C`}
                      />
  
                      <SummaryMetric
                        icon={
                          <ThermostatRoundedIcon />
                        }
                        label="Feels like"
                        value={`${bestSlot.feels_like}°C`}
                      />
  
                      <SummaryMetric
                        icon={
                          <WaterDropOutlinedIcon />
                        }
                        label="Humidity"
                        value={`${bestSlot.humidity}%`}
                      />
  
                      <SummaryMetric
                        icon={
                          <WbSunnyRoundedIcon />
                        }
                        label="UV index"
                        value={
                          bestSlot.uv_index
                        }
                      />
  
                      <SummaryMetric
                        icon={
                          <AirRoundedIcon />
                        }
                        label="Wind speed"
                        value={`${bestSlot.wind_speed} km/h`}
                      />
                    </Stack>
                  ) : (
                    <Typography
                      color="text.secondary"
                    >
                      No forecast
                      conditions available.
                    </Typography>
                  )}
                </SectionCard>
              </Grid>
            </Grid>
          </>
        )}
      </Box>
    );
  }
  
  
  function ForecastCard({
    slot,
  }) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 2,
          borderRadius: 2.5,
          height: "100%",
        }}
      >
        <Stack
          direction="row"
          spacing={1}
          sx={{
            justifyContent:
              "space-between",
            alignItems:
              "flex-start",
            mb: 2,
          }}
        >
          <Box>
            <Typography
              variant="body2"
              fontWeight={800}
            >
              {formatWindow(
                slot.start_time,
                slot.end_time
              )}
            </Typography>
  
            {slot.recommended && (
              <Typography
                variant="caption"
                color="success.main"
                fontWeight={700}
              >
                Recommended
              </Typography>
            )}
          </Box>
  
          <RiskBadge
            level={
              slot.risk_level
            }
          />
        </Stack>
  
        <Typography
          variant="h5"
          fontWeight={800}
        >
          {slot.temperature}°C
        </Typography>
  
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 0.5 }}
        >
          Feels like{" "}
          {slot.feels_like}°C
        </Typography>
  
        <Stack
          spacing={0.5}
          sx={{ mt: 2 }}
        >
          <Typography
            variant="caption"
            color="text.secondary"
          >
            Humidity{" "}
            {slot.humidity}%
          </Typography>
  
          <Typography
            variant="caption"
            color="text.secondary"
          >
            UV {slot.uv_index}
          </Typography>
  
          <Typography
            variant="caption"
            color="text.secondary"
          >
            Wind{" "}
            {slot.wind_speed} km/h
          </Typography>
        </Stack>
  
        <Typography
          variant="body2"
          fontWeight={800}
          sx={{ mt: 1.5 }}
        >
          Risk {slot.risk_score} / 10
        </Typography>
      </Paper>
    );
  }
  
  
  function SummaryMetric({
    icon,
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
        <Stack
          direction="row"
          spacing={1}
          sx={{
            alignItems: "center",
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
            variant="body2"
            color="text.secondary"
          >
            {label}
          </Typography>
        </Stack>
  
        <Typography
          variant="body2"
          fontWeight={800}
        >
          {value}
        </Typography>
      </Stack>
    );
  }
  
  
  function Meta({
    label,
    value,
  }) {
    return (
      <Box>
        <Typography
          variant="caption"
          color="text.secondary"
        >
          {label}
        </Typography>
  
        <Typography
          variant="body2"
          fontWeight={750}
        >
          {value || "—"}
        </Typography>
      </Box>
    );
  }