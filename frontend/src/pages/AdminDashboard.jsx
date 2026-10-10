import {
    useEffect,
    useState,
  } from "react";
  
  import {
    Alert,
    Box,
    CircularProgress,
    Grid,
    Stack,
    Typography,
  } from "@mui/material";
  
  import PeopleRoundedIcon from
    "@mui/icons-material/PeopleRounded";
  
  import EventNoteRoundedIcon from
    "@mui/icons-material/EventNoteRounded";
  
  import CloudRoundedIcon from
    "@mui/icons-material/CloudRounded";
  
  import WarningAmberRoundedIcon from
    "@mui/icons-material/WarningAmberRounded";
  
  import StatCard from
    "../components/dashboard/StatCard";
  
  import SectionCard from
    "../components/dashboard/SectionCard";
  
  import {
    getUsers,
    getWeatherRecords,
    getRiskRules,
  } from "../api/admin";
  
  import {
    getActivities,
    getActivityTypes,
  } from "../api/activities";
  
  
  export default function AdminDashboard() {
    const [data, setData] =
      useState(null);
  
    const [loading, setLoading] =
      useState(true);
  
    const [error, setError] =
      useState("");
  
  
    useEffect(() => {
      const load = async () => {
        try {
          const [
            users,
            activities,
            weather,
            rules,
            activityTypes,
          ] = await Promise.all([
            getUsers(),
            getActivities(),
            getWeatherRecords(),
            getRiskRules(),
            getActivityTypes(),
          ]);
  
          const assessments =
            activities.filter(
              (activity) =>
                activity.latest_assessment
            );
  
          const highRisk =
            assessments.filter(
              (activity) =>
                [
                  "HIGH",
                  "VERY_HIGH",
                ].includes(
                  activity.latest_assessment
                    ?.risk_level
                )
            );
  
          setData({
            users,
            activities,
            weather,
            rules,
            activityTypes,
            assessments,
            highRisk,
          });
        } catch (err) {
          console.error(err);
  
          setError(
            "Unable to load administrator dashboard."
          );
        } finally {
          setLoading(false);
        }
      };
  
      load();
    }, []);
  
  
    if (loading) {
      return (
        <Box
          sx={{
            py: 10,
            textAlign: "center",
          }}
        >
          <CircularProgress />
        </Box>
      );
    }
  
  
    return (
      <Box>
        <Typography
          variant="h4"
          fontWeight={800}
        >
          Administrator Dashboard
        </Typography>
  
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: 3 }}
        >
          Monitor HeatSafe users,
          activities, weather data and
          risk configuration.
        </Typography>
  
  
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
              title="Users"
              value={data?.users.length || 0}
              subtitle={`${
                data?.users.filter(
                  (user) =>
                    user.role ===
                    "SUPERVISOR"
                ).length || 0
              } supervisors`}
              icon={<PeopleRoundedIcon />}
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
              title="Activities"
              value={
                data?.activities.length || 0
              }
              subtitle={`${data?.assessments.length || 0} assessed`}
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
              title="Weather Records"
              value={
                data?.weather.length || 0
              }
              subtitle="Stored observations"
              icon={<CloudRoundedIcon />}
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
                data?.highRisk.length ||
                0
              }
              subtitle="High + very high"
              icon={
                <WarningAmberRoundedIcon />
              }
            />
          </Grid>
        </Grid>
  
  
        <Grid container spacing={2}>
          <Grid
            size={{
              xs: 12,
              lg: 6,
            }}
          >
            <SectionCard title="System Configuration">
              <Stack spacing={1.5}>
                <Info
                  label="Activity types"
                  value={
                    data?.activityTypes
                      .length || 0
                  }
                />
  
                <Info
                  label="Risk rules"
                  value={
                    data?.rules.length || 0
                  }
                />
  
                <Info
                  label="Active rules"
                  value={
                    data?.rules.filter(
                      (rule) =>
                        rule.is_active
                    ).length || 0
                  }
                />
              </Stack>
            </SectionCard>
          </Grid>
  
  
          <Grid
            size={{
              xs: 12,
              lg: 6,
            }}
          >
            <SectionCard title="Latest Weather Record">
              {data?.weather[0] ? (
                <Stack spacing={1.5}>
                  <Info
                    label="Location"
                    value={
                      data.weather[0]
                        .location
                    }
                  />
  
                  <Info
                    label="Temperature"
                    value={`${data.weather[0].temperature}°C`}
                  />
  
                  <Info
                    label="Feels like"
                    value={`${data.weather[0].feels_like}°C`}
                  />
  
                  <Info
                    label="Source"
                    value={
                      data.weather[0]
                        .source
                    }
                  />
                </Stack>
              ) : (
                <Typography
                  color="text.secondary"
                >
                  No weather data yet.
                </Typography>
              )}
            </SectionCard>
          </Grid>
        </Grid>
      </Box>
    );
  }
  
  
  function Info({ label, value }) {
    return (
      <Stack
        direction="row"
        sx={{
          justifyContent:
            "space-between",
        }}
      >
        <Typography
          color="text.secondary"
          variant="body2"
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
    );
  }