import {
    useEffect,
    useMemo,
    useState,
  } from "react";
  
  import {
    Navigate,
    useLocation,
    useNavigate,
  } from "react-router-dom";
  
  import {
    Alert,
    Box,
    Button,
    Chip,
    CircularProgress,
    Paper,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tooltip,
    Typography,
  } from "@mui/material";
  
  import ArrowBackRoundedIcon from
    "@mui/icons-material/ArrowBackRounded";
  
  import EventAvailableRoundedIcon from
    "@mui/icons-material/EventAvailableRounded";
  
  import CheckCircleOutlineRoundedIcon from
    "@mui/icons-material/CheckCircleOutlineRounded";
  
  import RiskBadge from
    "../components/dashboard/RiskBadge";
  
  import {
    getSaferTimes,
    rescheduleActivity,
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
  
  
  export default function SaferTimeComparisonPage() {
    const navigate = useNavigate();
    const location = useLocation();
  
    const result =
      location.state?.result;
  
    const activity =
      result?.activity;
  
    const assessment =
      result?.assessment;
  
    const [data, setData] =
      useState(null);
  
    const [loading, setLoading] =
      useState(true);
  
    const [saving, setSaving] =
      useState(false);
  
    const [error, setError] =
      useState("");
  
    const [selectedStartTime, setSelectedStartTime] =
      useState(null);
  
  
    useEffect(() => {
      if (!activity?.id) {
        return;
      }
  
      const loadSaferTimes =
        async () => {
          try {
            setLoading(true);
            setError("");
  
            const response =
              await getSaferTimes(
                activity.id
              );
  
            setData(response);
  
            const bestSlot =
              response.slots?.[0];
  
            if (bestSlot) {
              setSelectedStartTime(
                bestSlot.start_time
              );
            }
          } catch (err) {
            console.error(
              "Unable to load safer times:",
              err
            );
  
            setError(
              err.response?.data?.detail ||
                "Unable to load time-slot comparison."
            );
          } finally {
            setLoading(false);
          }
        };
  
      loadSaferTimes();
    }, [activity?.id]);
  
  
    const selectedSlot =
      useMemo(() => {
        return data?.slots?.find(
          (slot) =>
            slot.start_time ===
            selectedStartTime
        );
      }, [
        data,
        selectedStartTime,
      ]);
  
  
    if (!activity || !assessment) {
      return (
        <Navigate
          to="/supervisor/history"
          replace
        />
      );
    }
  
  
    const handleReschedule =
      async () => {
        if (!selectedSlot) {
          return;
        }
  
        try {
          setSaving(true);
          setError("");
  
          await rescheduleActivity(
            activity.id,
            selectedSlot.start_time
          );
  
          navigate(
            "/supervisor/history",
            {
              replace: true,
              state: {
                message:
                  `Activity rescheduled to ${formatTime(
                    selectedSlot.start_time
                  )}.`,
              },
            }
          );
        } catch (err) {
          console.error(
            "Unable to reschedule activity:",
            err
          );
  
          setError(
            err.response?.data?.detail ||
              "Unable to reschedule activity."
          );
        } finally {
          setSaving(false);
        }
      };
  
  
    return (
      <Box>
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="h4"
            fontWeight={800}
          >
            Safer Time Comparison
          </Typography>
  
          <Typography
            variant="body2"
            color="text.secondary"
          >
            Compare forecast conditions
            and heat risk across available
            start times.
          </Typography>
        </Box>
  
  
        {error && (
          <Alert
            severity="error"
            sx={{ mb: 2 }}
          >
            {error}
          </Alert>
        )}
  
  
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
  
              alignItems: {
                xs: "flex-start",
                md: "center",
              },
            }}
          >
            <ActivityMeta
              label="Activity"
              value={
                activity.activity_type_name
              }
            />
  
            <ActivityMeta
              label="Location"
              value={
                activity.location
              }
            />
  
            <ActivityMeta
              label="Date"
              value={
                activity.activity_date
              }
            />
  
            <ActivityMeta
              label="Current start"
              value={formatTime(
                activity.start_time
              )}
            />
  
            <Box>
              <Typography
                variant="caption"
                color="text.secondary"
              >
                Current risk
              </Typography>
  
              <Box sx={{ mt: 0.5 }}>
                <RiskBadge
                  level={
                    assessment.risk_level
                  }
                />
              </Box>
            </Box>
          </Stack>
        </Paper>
  
  
        {loading ? (
          <Paper
            elevation={0}
            sx={{
              py: 8,
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
                Comparing forecast
                conditions...
              </Typography>
            </Stack>
          </Paper>
        ) : (
          <Paper
            elevation={0}
            sx={{
              borderRadius: 3,
              overflow: "hidden",
            }}
          >
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow
                    sx={{
                      bgcolor:
                        "#FFF4EF",
                    }}
                  >
                    <TableCell>
                      Time
                    </TableCell>
  
                    <TableCell>
                      Temp
                    </TableCell>
  
                    <TableCell>
                      Feels like
                    </TableCell>
  
                    <TableCell>
                      Humidity
                    </TableCell>
  
                    <TableCell>
                      UV
                    </TableCell>
  
                    <TableCell>
                      Wind
                    </TableCell>
  
                    <TableCell>
                      Risk
                    </TableCell>
  
                    <TableCell>
                      Level
                    </TableCell>
  
                    <TableCell align="right">
                      Select
                    </TableCell>
                  </TableRow>
                </TableHead>
  
  
                <TableBody>
                  {data?.slots?.map(
                    (slot) => {
                      const isSelected =
                        slot.start_time ===
                        selectedStartTime;
  
                      return (
                        <TableRow
                          key={
                            slot.start_time
                          }
                          hover
                          onClick={() =>
                            setSelectedStartTime(
                              slot.start_time
                            )
                          }
                          sx={{
                            cursor:
                              "pointer",
  
                            ...(slot.is_current && {
                              bgcolor:
                                "#FFF4EF",
                            }),
  
                            ...(isSelected && {
                              bgcolor:
                                "#EAF8F1 !important",
                            }),
                          }}
                        >
                          <TableCell>
                            <Stack
                              direction="row"
                              spacing={1}
                              sx={{
                                alignItems:
                                  "center",
                                flexWrap:
                                  "wrap",
                              }}
                            >
                              <Typography
                                variant="body2"
                                fontWeight={700}
                              >
                                {formatWindow(
                                  slot.start_time,
                                  slot.end_time
                                )}
                              </Typography>
  
                              {slot.recommended && (
                                <Chip
                                  size="small"
                                  icon={
                                    <CheckCircleOutlineRoundedIcon />
                                  }
                                  label={
                                    slot.rank ===
                                    1
                                      ? "Best"
                                      : `Top ${slot.rank}`
                                  }
                                  color="success"
                                />
                              )}
  
                              {slot.is_current && (
                                <Chip
                                  size="small"
                                  label="Current"
                                  sx={{
                                    bgcolor:
                                      "#FFF0E8",
                                    color:
                                      "#D44A15",
                                  }}
                                />
                              )}
                            </Stack>
                          </TableCell>
  
  
                          <TableCell>
                            {
                              slot.temperature
                            }
                            °C
                          </TableCell>
  
  
                          <TableCell>
                            {
                              slot.feels_like
                            }
                            °C
                          </TableCell>
  
  
                          <TableCell>
                            {
                              slot.humidity
                            }
                            %
                          </TableCell>
  
  
                          <TableCell>
                            {
                              slot.uv_index
                            }
                          </TableCell>
  
  
                          <TableCell>
                            {
                              slot.wind_speed
                            }{" "}
                            km/h
                          </TableCell>
  
  
                          <TableCell>
                            <Typography
                              fontWeight={800}
                            >
                              {
                                slot.risk_score
                              }{" "}
                              / 10
                            </Typography>
                          </TableCell>
  
  
                          <TableCell>
                            <RiskBadge
                              level={
                                slot.risk_level
                              }
                            />
                          </TableCell>
  
  
                          <TableCell align="right">
                            <Button
                              size="small"
                              variant={
                                isSelected
                                  ? "contained"
                                  : "outlined"
                              }
                              onClick={(
                                event
                              ) => {
                                event.stopPropagation();
  
                                setSelectedStartTime(
                                  slot.start_time
                                );
                              }}
                            >
                              {isSelected
                                ? "Selected"
                                : "Choose"}
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    }
                  )}
  
  
                  {!data?.slots?.length && (
                    <TableRow>
                      <TableCell
                        colSpan={9}
                        align="center"
                        sx={{ py: 6 }}
                      >
                        <Typography
                          color="text.secondary"
                        >
                          No forecast slots
                          are available.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}
  
  
        {selectedSlot && (
          <Paper
            elevation={0}
            sx={{
              mt: 2.5,
              p: 2.5,
              borderRadius: 3,
              bgcolor: "#EAF8F1",
            }}
          >
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
                  xs:
                    "flex-start",
                  md: "center",
                },
              }}
            >
              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  Selected time
                </Typography>
  
                <Typography
                  variant="h6"
                  fontWeight={800}
                >
                  {formatWindow(
                    selectedSlot.start_time,
                    selectedSlot.end_time
                  )}
                </Typography>
  
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 0.5 }}
                >
                  Forecast{" "}
                  {
                    selectedSlot.temperature
                  }
                  °C · Feels like{" "}
                  {
                    selectedSlot.feels_like
                  }
                  °C · Risk{" "}
                  {
                    selectedSlot.risk_score
                  }
                  /10
                </Typography>
              </Box>
  
              <Stack
                direction="row"
                spacing={2}
                sx={{
                  alignItems:
                    "center",
                }}
              >
                {selectedSlot.recommended && (
                  <Chip
                    label={
                      selectedSlot.rank ===
                      1
                        ? "Best option"
                        : `Recommended #${selectedSlot.rank}`
                    }
                    color="success"
                  />
                )}
  
                <RiskBadge
                  level={
                    selectedSlot.risk_level
                  }
                />
              </Stack>
            </Stack>
          </Paper>
        )}
  
  
        <Stack
          direction={{
            xs: "column-reverse",
            sm: "row",
          }}
          spacing={1.5}
          sx={{
            mt: 3,
            justifyContent:
              "space-between",
          }}
        >
          <Button
            variant="outlined"
            color="secondary"
            startIcon={
              <ArrowBackRoundedIcon />
            }
            disabled={saving}
            onClick={() =>
              navigate(
                "/supervisor/assessment-results",
                {
                  state: {
                    result,
                  },
                }
              )
            }
          >
            Back to Results
          </Button>
  
          <Tooltip
            title={
              selectedSlot?.is_current
                ? "This is already the current activity start time."
                : ""
            }
          >
            <span>
              <Button
                variant="contained"
                startIcon={
                  saving ? (
                    <CircularProgress
                      size={18}
                      color="inherit"
                    />
                  ) : (
                    <EventAvailableRoundedIcon />
                  )
                }
                disabled={
                  saving ||
                  loading ||
                  !selectedSlot ||
                  selectedSlot.is_current
                }
                onClick={
                  handleReschedule
                }
              >
                {saving
                  ? "Rescheduling..."
                  : "Reschedule Activity"}
              </Button>
            </span>
          </Tooltip>
        </Stack>
      </Box>
    );
  }
  
  
  function ActivityMeta({
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
          fontWeight={700}
        >
          {value || "—"}
        </Typography>
      </Box>
    );
  }