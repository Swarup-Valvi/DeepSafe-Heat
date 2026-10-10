import {
    useEffect,
    useMemo,
    useState,
  } from "react";
  
  import {
    Alert,
    Box,
    Button,
    Chip,
    CircularProgress,
    MenuItem,
    Paper,
    Stack,
    TextField,
    Typography,
  } from "@mui/material";
  
  import WarningAmberRoundedIcon from
    "@mui/icons-material/WarningAmberRounded";
  
  import LocationOnOutlinedIcon from
    "@mui/icons-material/LocationOnOutlined";
  
  import AccessTimeRoundedIcon from
    "@mui/icons-material/AccessTimeRounded";
  
  import CheckCircleOutlineRoundedIcon from
    "@mui/icons-material/CheckCircleOutlineRounded";
  
  import RiskBadge from
    "../components/dashboard/RiskBadge";
  
  import {
    getDashboardReport,
  } from "../api/reports";
  
  
  function formatDate(value) {
    return new Date(value)
      .toLocaleString(
        "en-IN",
        {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit",
        }
      );
  }
  
  
  export default function AlertsPage() {
    const [assessments, setAssessments] =
      useState([]);
  
    const [reviewed, setReviewed] =
      useState(() => {
        try {
          return JSON.parse(
            localStorage.getItem(
              "heatsafe_reviewed_alerts"
            ) || "[]"
          );
        } catch {
          return [];
        }
      });
  
    const [riskFilter, setRiskFilter] =
      useState("ALL");
  
    const [showReviewed, setShowReviewed] =
      useState(false);
  
    const [loading, setLoading] =
      useState(true);
  
    const [error, setError] =
      useState("");
  
  
    useEffect(() => {
      const loadAlerts = async () => {
        try {
          const data =
            await getDashboardReport();
  
          setAssessments(
            data.recent_assessments ||
              []
          );
        } catch (err) {
          console.error(err);
  
          setError(
            "Unable to load alerts."
          );
        } finally {
          setLoading(false);
        }
      };
  
      loadAlerts();
    }, []);
  
  
    const alerts =
      useMemo(() => {
        return assessments
          .filter((assessment) =>
            [
              "HIGH",
              "VERY_HIGH",
            ].includes(
              assessment.risk_level
            )
          )
          .map((assessment) => ({
            id: assessment.id,
  
            title:
              assessment.risk_level ===
              "VERY_HIGH"
                ? "Very high heat risk"
                : "High heat risk",
  
            location:
              assessment.activity_location,
  
            activity:
              assessment.activity_name,
  
            level:
              assessment.risk_level,
  
            score:
              assessment.risk_score,
  
            recommendation:
              assessment.recommendation,
  
            createdAt:
              assessment.created_at,
  
            reviewed:
              reviewed.includes(
                assessment.id
              ),
          }))
          .filter((alert) => {
            const riskMatches =
              riskFilter === "ALL" ||
              alert.level ===
                riskFilter;
  
            const statusMatches =
              showReviewed
                ? alert.reviewed
                : !alert.reviewed;
  
            return (
              riskMatches &&
              statusMatches
            );
          });
      }, [
        assessments,
        reviewed,
        riskFilter,
        showReviewed,
      ]);
  
  
    const markReviewed = (id) => {
      const updated = [
        ...new Set([
          ...reviewed,
          id,
        ]),
      ];
  
      setReviewed(updated);
  
      localStorage.setItem(
        "heatsafe_reviewed_alerts",
        JSON.stringify(updated)
      );
    };
  
  
    if (loading) {
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
              Alerts
            </Typography>
  
            <Typography
              variant="body2"
              color="text.secondary"
            >
              Review high-risk heat
              assessments requiring
              attention.
            </Typography>
          </Box>
  
          <Stack
            direction={{
              xs: "column",
              sm: "row",
            }}
            spacing={1.5}
          >
            <TextField
              select
              size="small"
              label="Risk level"
              value={riskFilter}
              onChange={(event) =>
                setRiskFilter(
                  event.target.value
                )
              }
              sx={{ minWidth: 170 }}
            >
              <MenuItem value="ALL">
                All high-risk
              </MenuItem>
  
              <MenuItem value="HIGH">
                High
              </MenuItem>
  
              <MenuItem value="VERY_HIGH">
                Very High
              </MenuItem>
            </TextField>
  
            <Button
              variant="outlined"
              onClick={() =>
                setShowReviewed(
                  (current) =>
                    !current
                )
              }
            >
              {showReviewed
                ? "Active Alerts"
                : "Reviewed"}
            </Button>
          </Stack>
        </Stack>
  
  
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
            borderRadius: 3,
            p: 2.5,
          }}
        >
          <Stack spacing={1.5}>
            {alerts.map((alert) => (
              <AlertCard
                key={alert.id}
                alert={alert}
                onReview={
                  markReviewed
                }
              />
            ))}
  
            {!alerts.length && (
              <Box
                sx={{
                  py: 8,
                  textAlign: "center",
                }}
              >
                <CheckCircleOutlineRoundedIcon
                  sx={{
                    fontSize: 48,
                    color:
                      "success.main",
                    mb: 1,
                  }}
                />
  
                <Typography
                  fontWeight={800}
                >
                  No alerts found
                </Typography>
  
                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  No assessments match
                  the selected alert
                  filter.
                </Typography>
              </Box>
            )}
          </Stack>
        </Paper>
      </Box>
    );
  }
  
  
  function AlertCard({
    alert,
    onReview,
  }) {
    const veryHigh =
      alert.level === "VERY_HIGH";
  
    return (
      <Box
        sx={{
          p: 2,
          borderRadius: 2.5,
  
          bgcolor: veryHigh
            ? "#FDECEC"
            : "#FFF0E8",
  
          border: "1px solid",
          borderColor: "divider",
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
          }}
        >
          <Stack
            direction="row"
            spacing={1.5}
          >
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
  
                display: "grid",
                placeItems: "center",
  
                bgcolor: "#FFFFFF",
  
                color: veryHigh
                  ? "error.main"
                  : "warning.main",
  
                flexShrink: 0,
              }}
            >
              <WarningAmberRoundedIcon />
            </Box>
  
            <Box>
              <Stack
                direction="row"
                spacing={1}
                sx={{
                  alignItems: "center",
                  flexWrap: "wrap",
                }}
              >
                <Typography
                  fontWeight={800}
                >
                  {alert.title}
                </Typography>
  
                <RiskBadge
                  level={alert.level}
                />
              </Stack>
  
              <Typography
                variant="body2"
                sx={{ mt: 0.75 }}
              >
                {alert.activity} has a
                risk score of{" "}
                <strong>
                  {alert.score}/10
                </strong>
                .
              </Typography>
  
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.5 }}
              >
                {
                  alert.recommendation
                }
              </Typography>
  
              <Stack
                direction={{
                  xs: "column",
                  sm: "row",
                }}
                spacing={1.5}
                sx={{ mt: 1.5 }}
              >
                <Stack
                  direction="row"
                  spacing={0.5}
                  sx={{
                    alignItems:
                      "center",
                  }}
                >
                  <LocationOnOutlinedIcon
                    fontSize="small"
                  />
  
                  <Typography variant="caption">
                    {alert.location}
                  </Typography>
                </Stack>
  
                <Stack
                  direction="row"
                  spacing={0.5}
                  sx={{
                    alignItems:
                      "center",
                  }}
                >
                  <AccessTimeRoundedIcon
                    fontSize="small"
                  />
  
                  <Typography variant="caption">
                    {formatDate(
                      alert.createdAt
                    )}
                  </Typography>
                </Stack>
              </Stack>
            </Box>
          </Stack>
  
  
          {!alert.reviewed ? (
            <Button
              variant="outlined"
              onClick={() =>
                onReview(alert.id)
              }
              sx={{
                alignSelf: {
                  xs: "stretch",
                  md: "center",
                },
              }}
            >
              Mark Reviewed
            </Button>
          ) : (
            <Chip
              label="Reviewed"
              icon={
                <CheckCircleOutlineRoundedIcon />
              }
              color="success"
              size="small"
            />
          )}
        </Stack>
      </Box>
    );
  }