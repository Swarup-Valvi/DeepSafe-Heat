import { useEffect, useMemo, useState } from "react";

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  Grid,
  LinearProgress,
  Stack,
  Typography,
} from "@mui/material";

import { useNavigate } from "react-router-dom";

import ThermostatRoundedIcon from
  "@mui/icons-material/ThermostatRounded";

import EventNoteRoundedIcon from
  "@mui/icons-material/EventNoteRounded";

import WarningAmberRoundedIcon from
  "@mui/icons-material/WarningAmberRounded";

import AccessTimeRoundedIcon from
  "@mui/icons-material/AccessTimeRounded";

import LocationOnOutlinedIcon from
  "@mui/icons-material/LocationOnOutlined";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { useAuth } from "../context/AuthContext";

import {
  getDashboardReport,
  getRiskDistribution,
  getRiskTrends,
} from "../api/reports";

import RiskGauge from
  "../components/dashboard/RiskGauge";

import RiskBadge from
  "../components/dashboard/RiskBadge";

import SectionCard from
  "../components/dashboard/SectionCard";

import StatCard from
  "../components/dashboard/StatCard";


function formatRiskLevel(level) {
  if (!level) {
    return "NO DATA";
  }

  return level.replaceAll("_", " ");
}


function getRiskColor(level) {
  switch (level) {
    case "VERY_HIGH":
      return "error.main";

    case "HIGH":
      return "error.main";

    case "MODERATE":
      return "warning.main";

    case "LOW":
      return "success.main";

    default:
      return "text.secondary";
  }
}


function formatDate(value) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}


function formatTime(value) {
  if (!value) {
    return "—";
  }

  const [hourString, minute] = value.split(":");

  const date = new Date();

  date.setHours(
    Number(hourString),
    Number(minute),
    0,
    0
  );

  return date.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  });
}


export default function SupervisorDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [dashboard, setDashboard] = useState(null);
  const [trends, setTrends] = useState([]);
  const [distribution, setDistribution] =
    useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const [
          dashboardData,
          trendsData,
          distributionData,
        ] = await Promise.all([
          getDashboardReport(),
          getRiskTrends(),
          getRiskDistribution(),
        ]);

        setDashboard(dashboardData);
        setTrends(trendsData);
        setDistribution(distributionData);
      } catch (err) {
        console.error(
          "Failed to load dashboard:",
          err
        );

        setError(
          "Unable to load dashboard data. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);


  const recentAssessments =
    dashboard?.recent_assessments || [];


  const latestAssessment =
    recentAssessments.length > 0
      ? recentAssessments[0]
      : null;


  const currentRiskScore = latestAssessment
    ? Number(latestAssessment.risk_score)
    : 0;


  const currentRiskLevel =
    latestAssessment?.risk_level || null;


  const chartData = useMemo(() => {
    return trends.map((item) => ({
      date: new Date(
        `${item.date}T00:00:00`
      ).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
      }),

      score: Number(item.average_risk),

      assessments: item.total_assessments,
    }));
  }, [trends]);


  const locations = useMemo(() => {
    const locationMap = new Map();

    recentAssessments.forEach((assessment) => {
      const location =
        assessment.activity_location ||
        "Unknown location";

      const score =
        Number(assessment.risk_score) || 0;

      const existing =
        locationMap.get(location);

      if (
        !existing ||
        score > existing.score
      ) {
        locationMap.set(location, {
          name: location,
          score,
          level: assessment.risk_level,
        });
      }
    });

    return Array.from(
      locationMap.values()
    )
      .sort(
        (a, b) => b.score - a.score
      )
      .slice(0, 4);
  }, [recentAssessments]);


  const totalHighRisk =
    (distribution?.HIGH || 0) +
    (distribution?.VERY_HIGH || 0);


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
        <Stack
          alignItems="center"
          spacing={2}
        >
          <CircularProgress />

          <Typography
            color="text.secondary"
          >
            Loading dashboard...
          </Typography>
        </Stack>
      </Box>
    );
  }


  return (
    <Box>
      <Stack
        direction={{
          xs: "column",
          sm: "row",
        }}
        alignItems={{
          xs: "flex-start",
          sm: "center",
        }}
        justifyContent="space-between"
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography
            variant="h4"
            fontWeight={800}
          >
            Dashboard
          </Typography>

          <Typography
            color="text.secondary"
            variant="body2"
          >
            Welcome back,{" "}
            {user?.first_name || "Supervisor"}.
            Review your outdoor heat-risk
            assessments.
          </Typography>
        </Box>

        <Button
          variant="contained"
          onClick={() =>
            navigate(
              "/supervisor/plan-activity"
            )
          }
        >
          Plan an activity
        </Button>
      </Stack>


      {error && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
        >
          {error}
        </Alert>
      )}


      <Grid
        container
        spacing={2}
        sx={{ mb: 2 }}
      >
        <Grid
          size={{
            xs: 12,
            md: 6,
            lg: 3,
          }}
        >
          <SectionCard
            sx={{ height: "100%" }}
          >
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="flex-start"
            >
              <Box>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 1 }}
                >
                  Latest Heat Risk
                </Typography>

                <Typography
                  variant="h6"
                  color={getRiskColor(
                    currentRiskLevel
                  )}
                  fontWeight={800}
                >
                  {formatRiskLevel(
                    currentRiskLevel
                  )}
                </Typography>

                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  {latestAssessment
                    ? `Score ${currentRiskScore.toFixed(
                        2
                      )} / 10`
                    : "No assessments yet"}
                </Typography>
              </Box>

              <RiskGauge
                score={currentRiskScore}
                size={82}
              />
            </Stack>
          </SectionCard>
        </Grid>


        <Grid
          size={{
            xs: 12,
            sm: 6,
            lg: 3,
          }}
        >
          <StatCard
            title="Average Risk"
            value={
              dashboard
                ? `${dashboard.overall.average_risk} / 10`
                : "0 / 10"
            }
            subtitle="Across all assessments"
            icon={
              <ThermostatRoundedIcon />
            }
          />
        </Grid>


        <Grid
          size={{
            xs: 12,
            sm: 6,
            lg: 3,
          }}
        >
          <StatCard
            title="Assessments"
            value={
              dashboard?.overall
                ?.total_assessments || 0
            }
            subtitle={`${
              dashboard?.today
                ?.total_assessments || 0
            } today`}
            icon={<EventNoteRoundedIcon />}
          />
        </Grid>


        <Grid
          size={{
            xs: 12,
            sm: 6,
            lg: 3,
          }}
        >
          <StatCard
            title="High Risk"
            value={totalHighRisk}
            subtitle="High + very high"
            icon={
              <WarningAmberRoundedIcon />
            }
            iconBackground="#FDECEC"
            iconColor="#E5484D"
          />
        </Grid>
      </Grid>


      <Grid container spacing={2}>
        <Grid
          size={{
            xs: 12,
            lg: 8,
          }}
        >
          <SectionCard title="Risk Trend">
            {chartData.length > 0 ? (
              <Box sx={{ height: 270 }}>
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <AreaChart
                    data={chartData}
                  >
                    <defs>
                      <linearGradient
                        id="riskGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#F4511E"
                          stopOpacity={0.28}
                        />

                        <stop
                          offset="95%"
                          stopColor="#F4511E"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>

                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#ECEEF2"
                    />

                    <XAxis
                      dataKey="date"
                      axisLine={false}
                      tickLine={false}
                    />

                    <YAxis
                      domain={[0, 10]}
                      axisLine={false}
                      tickLine={false}
                    />

                    <Tooltip />

                    <Area
                      type="monotone"
                      dataKey="score"
                      name="Average risk"
                      stroke="#F4511E"
                      fill="url(#riskGradient)"
                      strokeWidth={3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            ) : (
              <Box
                sx={{
                  height: 270,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Typography
                  color="text.secondary"
                >
                  No trend data available yet.
                </Typography>
              </Box>
            )}


            {latestAssessment && (
              <Stack
                direction={{
                  xs: "column",
                  sm: "row",
                }}
                spacing={2}
                sx={{
                  mt: 1,
                  p: 1.5,
                  bgcolor: "#EAF8F1",
                  borderRadius: 2,
                }}
              >
                <AccessTimeRoundedIcon
                  sx={{
                    color: "success.main",
                  }}
                />

                <Box>
                  <Typography
                    variant="body2"
                    fontWeight={750}
                  >
                    Safer time window
                  </Typography>

                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    {formatTime(
                      latestAssessment
                        .safer_start_time
                    )}
                    {" – "}
                    {formatTime(
                      latestAssessment
                        .safer_end_time
                    )}

                    {latestAssessment
                      .alternative_start_time &&
                      ` or ${formatTime(
                        latestAssessment
                          .alternative_start_time
                      )} – ${formatTime(
                        latestAssessment
                          .alternative_end_time
                      )}`}
                  </Typography>
                </Box>
              </Stack>
            )}
          </SectionCard>
        </Grid>


        <Grid
          size={{
            xs: 12,
            lg: 4,
          }}
        >
          <SectionCard title="Locations by Risk">
            {locations.length > 0 ? (
              <Stack spacing={2}>
                {locations.map(
                  (location, index) => (
                    <Box
                      key={location.name}
                    >
                      <Stack
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                        spacing={1}
                      >
                        <Stack
                          direction="row"
                          spacing={1}
                          alignItems="center"
                        >
                          <Typography
                            variant="body2"
                            color="text.secondary"
                          >
                            {index + 1}.
                          </Typography>

                          <Typography
                            variant="body2"
                            fontWeight={700}
                          >
                            {location.name}
                          </Typography>
                        </Stack>

                        <Stack
                          direction="row"
                          spacing={1}
                          alignItems="center"
                        >
                          <Typography
                            variant="body2"
                            fontWeight={800}
                          >
                            {location.score.toFixed(
                              2
                            )}
                          </Typography>

                          <RiskBadge
                            level={
                              location.level
                            }
                          />
                        </Stack>
                      </Stack>

                      {index <
                        locations.length -
                          1 && (
                        <Divider
                          sx={{ mt: 2 }}
                        />
                      )}
                    </Box>
                  )
                )}
              </Stack>
            ) : (
              <Typography
                variant="body2"
                color="text.secondary"
              >
                No location data available.
              </Typography>
            )}
          </SectionCard>
        </Grid>


        <Grid
          size={{
            xs: 12,
            lg: 7,
          }}
        >
          <SectionCard
            title="Latest Assessment"
            action={
              <Button
                size="small"
                onClick={() =>
                  navigate(
                    "/supervisor/history"
                  )
                }
              >
                View all
              </Button>
            }
          >
            {latestAssessment ? (
              <Stack
                direction={{
                  xs: "column",
                  sm: "row",
                }}
                justifyContent="space-between"
                spacing={2}
              >
                <Box>
                  <Typography
                    fontWeight={800}
                  >
                    {
                      latestAssessment.activity_name
                    }
                  </Typography>

                  <Stack
                    direction="row"
                    spacing={0.75}
                    alignItems="center"
                    sx={{ mt: 0.75 }}
                  >
                    <LocationOnOutlinedIcon
                      fontSize="small"
                      color="action"
                    />

                    <Typography
                      variant="body2"
                      color="text.secondary"
                    >
                      {
                        latestAssessment.activity_location
                      }
                    </Typography>
                  </Stack>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 0.5 }}
                  >
                    Assessed{" "}
                    {formatDate(
                      latestAssessment.created_at
                    )}
                  </Typography>
                </Box>


                <Box
                  sx={{
                    minWidth: {
                      sm: 210,
                    },
                  }}
                >
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    sx={{ mb: 1 }}
                  >
                    <Typography
                      variant="body2"
                      color="text.secondary"
                    >
                      Risk score
                    </Typography>

                    <Typography
                      variant="body2"
                      fontWeight={800}
                      color={getRiskColor(
                        latestAssessment.risk_level
                      )}
                    >
                      {currentRiskScore.toFixed(
                        2
                      )}{" "}
                      / 10
                    </Typography>
                  </Stack>

                  <LinearProgress
                    variant="determinate"
                    value={Math.min(
                      currentRiskScore * 10,
                      100
                    )}
                    sx={{
                      height: 8,
                      borderRadius: 8,
                    }}
                  />

                  <Box sx={{ mt: 1 }}>
                    <RiskBadge
                      level={
                        latestAssessment.risk_level
                      }
                    />
                  </Box>
                </Box>
              </Stack>
            ) : (
              <Typography
                color="text.secondary"
              >
                No assessments available yet.
              </Typography>
            )}
          </SectionCard>
        </Grid>


        <Grid
          size={{
            xs: 12,
            lg: 5,
          }}
        >
          <SectionCard title="Risk Distribution">
            <Stack spacing={2}>
              <RiskDistributionRow
                label="Low"
                value={
                  distribution?.LOW || 0
                }
                total={
                  dashboard?.overall
                    ?.total_assessments || 0
                }
              />

              <RiskDistributionRow
                label="Moderate"
                value={
                  distribution?.MODERATE ||
                  0
                }
                total={
                  dashboard?.overall
                    ?.total_assessments || 0
                }
              />

              <RiskDistributionRow
                label="High"
                value={
                  distribution?.HIGH || 0
                }
                total={
                  dashboard?.overall
                    ?.total_assessments || 0
                }
              />

              <RiskDistributionRow
                label="Very High"
                value={
                  distribution?.VERY_HIGH ||
                  0
                }
                total={
                  dashboard?.overall
                    ?.total_assessments || 0
                }
              />
            </Stack>
          </SectionCard>
        </Grid>
      </Grid>
    </Box>
  );
}


function RiskDistributionRow({
  label,
  value,
  total,
}) {
  const percentage =
    total > 0
      ? Math.round((value / total) * 100)
      : 0;

  return (
    <Box>
      <Stack
        direction="row"
        sx={{
            justifyContent: "space-between",
            mb: 0.75,
        }}
        >
        <Typography
          variant="body2"
          fontWeight={650}
        >
          {label}
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
        >
          {value} ({percentage}%)
        </Typography>
      </Stack>

      <LinearProgress
        variant="determinate"
        value={percentage}
        sx={{
          height: 7,
          borderRadius: 5,
        }}
      />
    </Box>
  );
}