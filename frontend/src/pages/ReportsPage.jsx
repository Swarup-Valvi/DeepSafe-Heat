import {
    useEffect,
    useMemo,
    useState,
  } from "react";
  
  import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Grid,
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
    Typography,
  } from "@mui/material";
  
  import AssessmentRoundedIcon from
    "@mui/icons-material/AssessmentRounded";
  
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
  
  import StatCard from
    "../components/dashboard/StatCard";
  
  import {
    getDashboardReport,
    getRiskDistribution,
    getRiskTrends,
  } from "../api/reports";
  
  
  function formatDate(value) {
    if (!value) {
      return "—";
    }
  
    return new Date(value).toLocaleDateString(
      "en-IN",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  }
  
  
  export default function ReportsPage() {
    const [dashboard, setDashboard] =
      useState(null);
  
    const [trends, setTrends] =
      useState([]);
  
    const [distribution, setDistribution] =
      useState(null);
  
    const [riskFilter, setRiskFilter] =
      useState("ALL");
  
    const [loading, setLoading] =
      useState(true);
  
    const [error, setError] =
      useState("");
  
  
    useEffect(() => {
      const loadReports = async () => {
        try {
          setLoading(true);
          setError("");
  
          const [
            dashboardData,
            trendData,
            distributionData,
          ] = await Promise.all([
            getDashboardReport(),
            getRiskTrends(),
            getRiskDistribution(),
          ]);
  
          setDashboard(dashboardData);
          setTrends(trendData);
          setDistribution(
            distributionData
          );
        } catch (err) {
          console.error(err);
  
          setError(
            "Unable to load reports."
          );
        } finally {
          setLoading(false);
        }
      };
  
      loadReports();
    }, []);
  
  
    const assessments =
      dashboard?.recent_assessments || [];
  
  
    const filteredAssessments =
      useMemo(() => {
        if (riskFilter === "ALL") {
          return assessments;
        }
  
        return assessments.filter(
          (assessment) =>
            assessment.risk_level ===
            riskFilter
        );
      }, [
        assessments,
        riskFilter,
      ]);
  
  
    const chartData =
      trends.map((item) => ({
        date: new Date(
          `${item.date}T00:00:00`
        ).toLocaleDateString(
          "en-IN",
          {
            day: "numeric",
            month: "short",
          }
        ),
  
        risk:
          Number(
            item.average_risk
          ) || 0,
      }));
  
  
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
              Reports
            </Typography>
  
            <Typography
              variant="body2"
              color="text.secondary"
            >
              Review heat-risk trends
              and assessment history.
            </Typography>
          </Box>
  
          <Button
            variant="contained"
            startIcon={
              <AssessmentRoundedIcon />
            }
            onClick={() =>
              window.print()
            }
          >
            Export Report
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
          sx={{ mb: 2.5 }}
        >
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
                  ?.total_assessments ||
                0
              }
              subtitle="Total assessments"
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
              title="Average Risk"
              value={`${dashboard?.overall?.average_risk || 0} / 10`}
              subtitle="Overall average"
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
              value={
                (distribution?.HIGH ||
                  0) +
                (distribution
                  ?.VERY_HIGH || 0)
              }
              subtitle="High + very high"
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
              title="Rescheduled"
              value={
                dashboard
                  ?.rescheduled_activities ||
                0
              }
              subtitle="Activities moved"
            />
          </Grid>
        </Grid>
  
  
        <Grid
          container
          spacing={2.5}
          sx={{ mb: 2.5 }}
        >
          <Grid
            size={{
              xs: 12,
              lg: 8,
            }}
          >
            <SectionCard title="Risk Trend">
              {chartData.length ? (
                <Box sx={{ height: 280 }}>
                  <ResponsiveContainer
                    width="100%"
                    height="100%"
                  >
                    <AreaChart
                      data={chartData}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
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
                        dataKey="risk"
                        stroke="#F4511E"
                        fill="#FFF0E8"
                        strokeWidth={3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </Box>
              ) : (
                <Typography
                  color="text.secondary"
                >
                  No trend data available.
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
            <SectionCard title="Risk Distribution">
              <Stack spacing={2}>
                <DistributionRow
                  label="Low"
                  value={
                    distribution?.LOW ||
                    0
                  }
                />
  
                <DistributionRow
                  label="Moderate"
                  value={
                    distribution
                      ?.MODERATE || 0
                  }
                />
  
                <DistributionRow
                  label="High"
                  value={
                    distribution?.HIGH ||
                    0
                  }
                />
  
                <DistributionRow
                  label="Very High"
                  value={
                    distribution
                      ?.VERY_HIGH || 0
                  }
                />
              </Stack>
            </SectionCard>
          </Grid>
        </Grid>
  
  
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            borderRadius: 3,
            mb: 2,
          }}
        >
          <TextField
            select
            label="Risk level"
            value={riskFilter}
            onChange={(event) =>
              setRiskFilter(
                event.target.value
              )
            }
            sx={{ minWidth: 220 }}
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
        </Paper>
  
  
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
                    Date
                  </TableCell>
  
                  <TableCell>
                    Activity
                  </TableCell>
  
                  <TableCell>
                    Location
                  </TableCell>
  
                  <TableCell>
                    Temperature
                  </TableCell>
  
                  <TableCell>
                    Risk score
                  </TableCell>
  
                  <TableCell>
                    Risk level
                  </TableCell>
                </TableRow>
              </TableHead>
  
              <TableBody>
                {filteredAssessments.map(
                  (assessment) => (
                    <TableRow
                      key={
                        assessment.id
                      }
                      hover
                    >
                      <TableCell>
                        {formatDate(
                          assessment.created_at
                        )}
                      </TableCell>
  
                      <TableCell>
                        <Typography
                          variant="body2"
                          fontWeight={700}
                        >
                          {
                            assessment.activity_name
                          }
                        </Typography>
                      </TableCell>
  
                      <TableCell>
                        {
                          assessment.activity_location
                        }
                      </TableCell>
  
                      <TableCell>
                        {
                          assessment.temperature
                        }
                        °C
                      </TableCell>
  
                      <TableCell>
                        <Typography
                          fontWeight={800}
                        >
                          {
                            assessment.risk_score
                          }{" "}
                          / 10
                        </Typography>
                      </TableCell>
  
                      <TableCell>
                        <RiskBadge
                          level={
                            assessment.risk_level
                          }
                        />
                      </TableCell>
                    </TableRow>
                  )
                )}
  
                {!filteredAssessments
                  .length && (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      align="center"
                      sx={{ py: 6 }}
                    >
                      No assessments
                      found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Box>
    );
  }
  
  
  function DistributionRow({
    label,
    value,
  }) {
    return (
      <Stack
        direction="row"
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
          fontWeight={800}
        >
          {value}
        </Typography>
      </Stack>
    );
  }