import {
    useEffect,
    useState,
  } from "react";
  
  import {
    useNavigate,
    useParams,
  } from "react-router-dom";
  
  import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Divider,
    Grid,
    Paper,
    Stack,
    Typography,
  } from "@mui/material";
  
  import ArrowBackRoundedIcon from
    "@mui/icons-material/ArrowBackRounded";
  
  import AccessTimeRoundedIcon from
    "@mui/icons-material/AccessTimeRounded";
  
  import RiskGauge from
    "../components/dashboard/RiskGauge";
  
  import RiskBadge from
    "../components/dashboard/RiskBadge";
  
  import SectionCard from
    "../components/dashboard/SectionCard";
  
  import {
    getActivity,
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
  
  
  function formatDate(value) {
    if (!value) {
      return "—";
    }
  
    return new Date(
      `${value}T00:00:00`
    ).toLocaleDateString(
      "en-IN",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  }
  
  
  export default function ActivityDetailsPage() {
    const { activityId } =
      useParams();
  
    const navigate =
      useNavigate();
  
    const [activity, setActivity] =
      useState(null);
  
    const [loading, setLoading] =
      useState(true);
  
    const [error, setError] =
      useState("");
  
  
    useEffect(() => {
      const loadActivity =
        async () => {
          try {
            setLoading(true);
            setError("");
  
            const data =
              await getActivity(
                activityId
              );
  
            setActivity(data);
          } catch (err) {
            console.error(
              "Unable to load activity:",
              err
            );
  
            setError(
              err.response?.data?.detail ||
                "Unable to load activity."
            );
          } finally {
            setLoading(false);
          }
        };
  
      if (activityId) {
        loadActivity();
      }
    }, [activityId]);
  
  
    if (loading) {
      return (
        <Box
          sx={{
            minHeight: 400,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CircularProgress />
        </Box>
      );
    }
  
  
    if (
      error ||
      !activity
    ) {
      return (
        <Box>
          <Alert
            severity="error"
            sx={{ mb: 2 }}
          >
            {error ||
              "Activity not found."}
          </Alert>
  
          <Button
            variant="outlined"
            startIcon={
              <ArrowBackRoundedIcon />
            }
            onClick={() =>
              navigate(
                "/supervisor/history"
              )
            }
          >
            Back to History
          </Button>
        </Box>
      );
    }
  
  
    const assessment =
      activity.latest_assessment;
  
    const riskScore =
      Number(
        assessment?.risk_score
      ) || 0;
  
  
    return (
      <Box>
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
  
            mb: 3,
          }}
        >
          <Box>
            <Typography
              variant="h4"
              fontWeight={800}
            >
              Activity Details
            </Typography>
  
            <Typography
              variant="body2"
              color="text.secondary"
            >
              Review activity details
              and its latest heat-risk
              assessment.
            </Typography>
          </Box>
  
          {assessment && (
            <RiskBadge
              level={
                assessment.risk_level
              }
            />
          )}
        </Stack>
  
  
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
            <SectionCard title="Activity Information">
              <Grid
                container
                spacing={2}
              >
                <InfoItem
                  label="Activity"
                  value={
                    activity.activity_type_name
                  }
                />
  
                <InfoItem
                  label="Intensity"
                  value={
                    activity.activity_intensity
                  }
                />
  
                <InfoItem
                  label="Location"
                  value={
                    activity.location
                  }
                />
  
                <InfoItem
                  label="Date"
                  value={formatDate(
                    activity.activity_date
                  )}
                />
  
                <InfoItem
                  label="Start time"
                  value={formatTime(
                    activity.start_time
                  )}
                />
  
                <InfoItem
                  label="Duration"
                  value={`${activity.duration_hours} hours`}
                />
  
                <InfoItem
                  label="Sun exposure"
                  value={
                    activity.sun_exposure
                  }
                />
  
                <InfoItem
                  label="Worker category"
                  value={
                    activity.worker_category
                  }
                />
  
                <InfoItem
                  label="Water available"
                  value={
                    activity.water_available
                      ? "Yes"
                      : "No"
                  }
                />
  
                <InfoItem
                  label="Rest area"
                  value={
                    activity.rest_area_available
                      ? "Available"
                      : "Not available"
                  }
                />
  
                <InfoItem
                  label="Status"
                  value={
                    activity.status
                  }
                />
  
                {activity.original_start_time && (
                  <InfoItem
                    label="Original time"
                    value={formatTime(
                      activity.original_start_time
                    )}
                  />
                )}
              </Grid>
  
  
              {activity.notes && (
                <>
                  <Divider
                    sx={{ my: 2.5 }}
                  />
  
                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    Notes
                  </Typography>
  
                  <Typography
                    variant="body2"
                    sx={{ mt: 0.5 }}
                  >
                    {activity.notes}
                  </Typography>
                </>
              )}
            </SectionCard>
          </Grid>
  
  
          <Grid
            size={{
              xs: 12,
              lg: 5,
            }}
          >
            {assessment ? (
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 3,
                }}
              >
                <Typography
                  variant="h6"
                  fontWeight={800}
                  textAlign="center"
                >
                  Latest Assessment
                </Typography>
  
                <Stack
                  sx={{
                    alignItems:
                      "center",
                    mt: 2,
                  }}
                >
                  <RiskGauge
                    score={riskScore}
                    size={150}
                  />
  
                  <Box sx={{ mt: 2 }}>
                    <RiskBadge
                      level={
                        assessment.risk_level
                      }
                    />
                  </Box>
                </Stack>
  
  
                <Divider
                  sx={{ my: 3 }}
                />
  
  
                <Stack spacing={1.5}>
                  <SummaryRow
                    label="Risk score"
                    value={`${riskScore.toFixed(
                      2
                    )} / 10`}
                  />
  
                  <SummaryRow
                    label="Method"
                    value={
                      assessment.assessment_method?.replaceAll(
                        "_",
                        " "
                      )
                    }
                  />
  
                  <SummaryRow
                    label="Safer window"
                    value={`${formatTime(
                      assessment.safer_start_time
                    )} – ${formatTime(
                      assessment.safer_end_time
                    )}`}
                  />
  
                  {assessment
                    .alternative_start_time && (
                    <SummaryRow
                      label="Alternative"
                      value={`${formatTime(
                        assessment.alternative_start_time
                      )} – ${formatTime(
                        assessment.alternative_end_time
                      )}`}
                    />
                  )}
                </Stack>
  
  
                <Box
                  sx={{
                    mt: 2.5,
                    p: 2,
                    bgcolor:
                      "#FFF8F5",
                    borderRadius: 2,
                  }}
                >
                  <Typography
                    variant="body2"
                    fontWeight={800}
                  >
                    Recommendation
                  </Typography>
  
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 0.75 }}
                  >
                    {
                      assessment.recommendation
                    }
                  </Typography>
                </Box>
  
  
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={
                    <AccessTimeRoundedIcon />
                  }
                  sx={{ mt: 2.5 }}
                  onClick={() =>
                    navigate(
                      "/supervisor/safer-time",
                      {
                        state: {
                          result: {
                            activity,
                            assessment,
                          },
                        },
                      }
                    )
                  }
                >
                  Compare Safer Times
                </Button>
              </Paper>
            ) : (
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 3,
                }}
              >
                <Typography
                  variant="h6"
                  fontWeight={800}
                >
                  Not Assessed
                </Typography>
  
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1 }}
                >
                  This activity does
                  not have a heat-risk
                  assessment yet.
                </Typography>
              </Paper>
            )}
          </Grid>
        </Grid>
  
  
        <Button
          variant="outlined"
          startIcon={
            <ArrowBackRoundedIcon />
          }
          sx={{ mt: 3 }}
          onClick={() =>
            navigate(
              "/supervisor/history"
            )
          }
        >
          Back to History
        </Button>
      </Box>
    );
  }
  
  
  function InfoItem({
    label,
    value,
  }) {
    return (
      <Grid
        size={{
          xs: 12,
          sm: 6,
        }}
      >
        <Box
          sx={{
            p: 1.75,
            borderRadius: 2,
            bgcolor: "#F8FAFC",
            border: "1px solid",
            borderColor:
              "divider",
          }}
        >
          <Typography
            variant="caption"
            color="text.secondary"
          >
            {label}
          </Typography>
  
          <Typography
            variant="body2"
            fontWeight={750}
            sx={{ mt: 0.5 }}
          >
            {value || "—"}
          </Typography>
        </Box>
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
        }}
      >
        <Typography
          variant="body2"
          color="text.secondary"
        >
          {label}
        </Typography>
  
        <Typography
          variant="body2"
          fontWeight={750}
          textAlign="right"
        >
          {value || "—"}
        </Typography>
      </Stack>
    );
  }