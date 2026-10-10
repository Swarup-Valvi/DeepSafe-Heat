import {
    useEffect,
    useMemo,
    useState,
  } from "react";
  
  import {
    useLocation,
    useNavigate,
  } from "react-router-dom";
  
  import {
    Alert,
    Box,
    Button,
    Chip,
    CircularProgress,
    IconButton,
    MenuItem,
    Paper,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Tooltip,
    Typography,
  } from "@mui/material";
  
  import VisibilityOutlinedIcon from
    "@mui/icons-material/VisibilityOutlined";
  import AddRoundedIcon from
    "@mui/icons-material/AddRounded";
  
  import RiskBadge from
    "../components/dashboard/RiskBadge";
  
  import {
    getActivities,
  } from "../api/activities";
  
  
  export default function ActivityHistoryPage() {
    const navigate = useNavigate();
    const location = useLocation();
  
    const [activities, setActivities] =
      useState([]);
  
    const [loading, setLoading] =
      useState(true);
  
    const [error, setError] =
      useState("");
  
    const [activityType, setActivityType] =
      useState("ALL");
  
    const [riskLevel, setRiskLevel] =
      useState("ALL");
  
    const successMessage =
      location.state?.message;
  
  
    useEffect(() => {
      const loadActivities =
        async () => {
          try {
            setLoading(true);
  
            const data =
              await getActivities();
  
            setActivities(data);
          } catch (err) {
            console.error(err);
  
            setError(
              "Unable to load activities."
            );
          } finally {
            setLoading(false);
          }
        };
  
      loadActivities();
    }, []);
  
  
    const activityNames =
      useMemo(() => {
        return [
          ...new Set(
            activities
              .map(
                (item) =>
                  item.activity_type_name
              )
              .filter(Boolean)
          ),
        ];
      }, [activities]);
  
  
    const filteredActivities =
      activities.filter(
        (activity) => {
          const assessment =
            activity.latest_assessment;
  
          const matchesActivity =
            activityType === "ALL" ||
            activity.activity_type_name ===
              activityType;
  
          const matchesRisk =
            riskLevel === "ALL" ||
            assessment?.risk_level ===
              riskLevel;
  
          return (
            matchesActivity &&
            matchesRisk
          );
        }
      );
  
  
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
              Activity History
            </Typography>
  
            <Typography
              variant="body2"
              color="text.secondary"
            >
              View your planned,
              assessed and rescheduled
              activities.
            </Typography>
          </Box>
  
          <Button
            variant="contained"
            startIcon={
              <AddRoundedIcon />
            }
            onClick={() =>
              navigate(
                "/supervisor/plan-activity"
              )
            }
          >
            Plan Activity
          </Button>
        </Stack>
  
        {successMessage && (
          <Alert
            severity="success"
            sx={{ mb: 2 }}
          >
            {successMessage}
          </Alert>
        )}
  
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
            mb: 2,
            borderRadius: 3,
          }}
        >
          <Stack
            direction={{
              xs: "column",
              md: "row",
            }}
            spacing={2}
          >
            <TextField
              select
              label="Activity type"
              value={activityType}
              onChange={(event) =>
                setActivityType(
                  event.target.value
                )
              }
            >
              <MenuItem value="ALL">
                All activities
              </MenuItem>
  
              {activityNames.map(
                (name) => (
                  <MenuItem
                    key={name}
                    value={name}
                  >
                    {name}
                  </MenuItem>
                )
              )}
            </TextField>
  
            <TextField
              select
              label="Risk level"
              value={riskLevel}
              onChange={(event) =>
                setRiskLevel(
                  event.target.value
                )
              }
            >
              <MenuItem value="ALL">
                All risk levels
              </MenuItem>
  
              <MenuItem value="LOW">
                Low
              </MenuItem>
  
              <MenuItem value="MODERATE">
                Moderate
              </MenuItem>
  
              <MenuItem value="HIGH">
                High
              </MenuItem>
  
              <MenuItem value="VERY_HIGH">
                Very High
              </MenuItem>
            </TextField>
          </Stack>
        </Paper>
  
        <Paper
          elevation={0}
          sx={{
            borderRadius: 3,
            overflow: "hidden",
          }}
        >
          {loading ? (
            <Box
              sx={{
                py: 8,
                display: "flex",
                justifyContent:
                  "center",
              }}
            >
              <CircularProgress />
            </Box>
          ) : (
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
                      Date
                    </TableCell>
  
                    <TableCell>
                      Activity
                    </TableCell>
  
                    <TableCell>
                      Location
                    </TableCell>
  
                    <TableCell>
                      Time
                    </TableCell>
  
                    <TableCell>
                      Duration
                    </TableCell>
  
                    <TableCell>
                      Risk score
                    </TableCell>
  
                    <TableCell>
                      Risk level
                    </TableCell>
  
                    <TableCell>
                      Status
                    </TableCell>
  
                    <TableCell align="right">
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
  
                <TableBody>
                  {filteredActivities.map(
                    (activity) => {
                      const assessment =
                        activity.latest_assessment;
  
                      return (
                        <TableRow
                          key={
                            activity.id
                          }
                          hover
                        >
                          <TableCell>
                            {
                              activity.activity_date
                            }
                          </TableCell>
  
                          <TableCell>
                            <Typography
                              variant="body2"
                              fontWeight={700}
                            >
                              {
                                activity.activity_type_name
                              }
                            </Typography>
                          </TableCell>
  
                          <TableCell>
                            {
                              activity.location
                            }
                          </TableCell>
  
                          <TableCell>
                            {
                              activity.start_time
                            }
                          </TableCell>
  
                          <TableCell>
                            {
                              activity.duration_hours
                            }{" "}
                            hours
                          </TableCell>
  
                          <TableCell>
                            {assessment ? (
                              <Typography fontWeight={800}>
                                {
                                  assessment.risk_score
                                }{" "}
                                / 10
                              </Typography>
                            ) : (
                              "—"
                            )}
                          </TableCell>
  
                          <TableCell>
                            {assessment ? (
                              <RiskBadge
                                level={
                                  assessment.risk_level
                                }
                              />
                            ) : (
                              "Not assessed"
                            )}
                          </TableCell>
  
                          <TableCell>
                            <StatusChip
                              status={
                                activity.status
                              }
                            />
                          </TableCell>
  
                          <TableCell align="right">
                            <Tooltip title="View details">
                              <IconButton
                                size="small"
                                onClick={() =>
                                  navigate(
                                    `/supervisor/history/${activity.id}`
                                  )
                                }
                              >
                                <VisibilityOutlinedIcon />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      );
                    }
                  )}
  
                  {filteredActivities.length ===
                    0 && (
                    <TableRow>
                      <TableCell
                        colSpan={9}
                        align="center"
                        sx={{ py: 6 }}
                      >
                        <Typography color="text.secondary">
                          No activities
                          found.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      </Box>
    );
  }
  
  
  function StatusChip({ status }) {
    const formatted =
      status
        ?.replaceAll("_", " ")
        .toLowerCase()
        .replace(
          /\b\w/g,
          (character) =>
            character.toUpperCase()
        ) || "Unknown";
  
    const config = {
      PLANNED: {
        color: "#175CD3",
        background: "#EFF8FF",
      },
  
      ASSESSED: {
        color: "#16875D",
        background: "#EAF8F1",
      },
  
      RESCHEDULED: {
        color: "#B54708",
        background: "#FFF6DF",
      },
    };
  
    const style =
      config[status] || {
        color: "#475467",
        background: "#F2F4F7",
      };
  
    return (
      <Chip
        label={formatted}
        size="small"
        sx={{
          color: style.color,
          bgcolor:
            style.background,
          fontWeight: 700,
        }}
      />
    );
  }