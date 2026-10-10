import {
    useEffect,
    useMemo,
    useState,
  } from "react";
  
  import { useNavigate } from "react-router-dom";
  
  import {
    Alert,
    Box,
    Button,
    CircularProgress,
    FormControl,
    FormControlLabel,
    Grid,
    InputAdornment,
    MenuItem,
    Paper,
    Radio,
    RadioGroup,
    Stack,
    TextField,
    Typography,
  } from "@mui/material";
  
  import LocationOnOutlinedIcon from
    "@mui/icons-material/LocationOnOutlined";
  import CalendarMonthOutlinedIcon from
    "@mui/icons-material/CalendarMonthOutlined";
  import AccessTimeOutlinedIcon from
    "@mui/icons-material/AccessTimeOutlined";
  import TimerOutlinedIcon from
    "@mui/icons-material/TimerOutlined";
  import WbSunnyOutlinedIcon from
    "@mui/icons-material/WbSunnyOutlined";
  import WaterDropOutlinedIcon from
    "@mui/icons-material/WaterDropOutlined";
  import WeekendOutlinedIcon from
    "@mui/icons-material/WeekendOutlined";
  
  import {
    assessActivity,
    createActivity,
    geocodeLocation,
    getActivityTypes,
  } from "../api/activities";
  
  
  const today = new Date()
    .toISOString()
    .split("T")[0];
  
  
  const initialForm = {
    location: "Pune, Maharashtra",
    date: today,
    startTime: "09:00",
    activityType: "",
    duration: "4",
    sunExposure: "DIRECT",
    waterAvailable: "true",
    restAreaAvailable: "false",
    workerCategory:
      "General Adult (16–60 years)",
    notes: "",
  };
  
  
  const workerCategories = [
    "General Adult (16–60 years)",
    "Older Adult (60+ years)",
    "Young Worker (16–25 years)",
    "Heat-sensitive Worker",
  ];
  
  
  export default function PlanActivityPage() {
    const navigate = useNavigate();
  
    const [formData, setFormData] =
      useState(initialForm);
  
    const [activityTypes, setActivityTypes] =
      useState([]);
  
    const [loadingTypes, setLoadingTypes] =
      useState(true);
  
    const [submitting, setSubmitting] =
      useState(false);
  
    const [error, setError] = useState("");
  
  
    useEffect(() => {
      const loadTypes = async () => {
        try {
          const data =
            await getActivityTypes();
  
          setActivityTypes(data);
  
          if (data.length > 0) {
            setFormData((current) => ({
              ...current,
              activityType: String(
                data[0].id
              ),
            }));
          }
        } catch (err) {
          console.error(err);
  
          setError(
            "Unable to load activity types."
          );
        } finally {
          setLoadingTypes(false);
        }
      };
  
      loadTypes();
    }, []);
  
  
    const selectedActivityType =
      useMemo(() => {
        return activityTypes.find(
          (item) =>
            String(item.id) ===
            String(formData.activityType)
        );
      }, [
        activityTypes,
        formData.activityType,
      ]);
  
  
    const handleChange = (event) => {
      const { name, value } =
        event.target;
  
      setFormData((current) => ({
        ...current,
        [name]: value,
      }));
    };
  
  
    const handleSubmit = async (event) => {
      event.preventDefault();
  
      setError("");
  
      if (!formData.location.trim()) {
        setError(
          "Please enter an activity location."
        );
        return;
      }
  
      if (
        !formData.date ||
        !formData.startTime
      ) {
        setError(
          "Please select the activity date and start time."
        );
        return;
      }
  
      if (
        !formData.duration ||
        Number(formData.duration) <= 0
      ) {
        setError(
          "Duration must be greater than zero."
        );
        return;
      }
  
      if (!formData.activityType) {
        setError(
          "Please select an activity type."
        );
        return;
      }
  
      try {
        setSubmitting(true);
  
        const coordinates =
          await geocodeLocation(
            formData.location
          );
  
        const payload = {
          activity_type:
            Number(formData.activityType),
  
          location:
            formData.location.trim(),
  
          latitude:
            coordinates.latitude,
  
          longitude:
            coordinates.longitude,
  
          activity_date:
            formData.date,
  
          start_time:
            formData.startTime,
  
          duration_hours:
            Number(formData.duration),
  
          sun_exposure:
            formData.sunExposure,
  
          water_available:
            formData.waterAvailable ===
            "true",
  
          rest_area_available:
            formData.restAreaAvailable ===
            "true",
  
          worker_category:
            formData.workerCategory,
  
          notes:
            formData.notes.trim(),
        };
  
        const activity =
          await createActivity(payload);
  
        const result =
          await assessActivity(
            activity.id
          );
  
        navigate(
          "/supervisor/assessment-results",
          {
            state: {
              result,
            },
          }
        );
      } catch (err) {
        console.error(err);
  
        const backendData =
          err.response?.data;
  
        if (backendData) {
          setError(
            typeof backendData ===
              "string"
              ? backendData
              : JSON.stringify(
                  backendData
                )
          );
        } else {
          setError(
            err.message ||
              "Unable to assess activity."
          );
        }
      } finally {
        setSubmitting(false);
      }
    };
  
  
    return (
      <Box>
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="h4"
            fontWeight={800}
          >
            Plan Activity
          </Typography>
  
          <Typography
            color="text.secondary"
            variant="body2"
          >
            Enter activity details and
            HeatSafe will retrieve the
            expected weather automatically.
          </Typography>
        </Box>
  
        <Paper
          component="form"
          onSubmit={handleSubmit}
          elevation={0}
          sx={{
            p: {
              xs: 2.5,
              md: 3.5,
            },
            borderRadius: 3,
            maxWidth: 1100,
          }}
        >
          <Stack spacing={3}>
            <Box>
              <Typography
                variant="h6"
                fontWeight={800}
              >
                Plan a New Activity
              </Typography>
  
              <Typography
                variant="body2"
                color="text.secondary"
              >
                Weather and heat risk will
                be assessed after you submit
                the activity.
              </Typography>
            </Box>
  
            {error && (
              <Alert severity="error">
                {error}
              </Alert>
            )}
  
            <Grid
              container
              spacing={2.5}
            >
              <Grid
                size={{
                  xs: 12,
                  md: 5,
                }}
              >
                <TextField
                  fullWidth
                  label="Location"
                  name="location"
                  value={
                    formData.location
                  }
                  onChange={
                    handleChange
                  }
                  required
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <LocationOnOutlinedIcon fontSize="small" />
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              </Grid>
  
              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                  md: 3.5,
                }}
              >
                <TextField
                  fullWidth
                  label="Date"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={
                    handleChange
                  }
                  required
                  slotProps={{
                    inputLabel: {
                      shrink: true,
                    },
  
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <CalendarMonthOutlinedIcon fontSize="small" />
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              </Grid>
  
              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                  md: 3.5,
                }}
              >
                <TextField
                  fullWidth
                  label="Start time"
                  name="startTime"
                  type="time"
                  value={
                    formData.startTime
                  }
                  onChange={
                    handleChange
                  }
                  required
                  slotProps={{
                    inputLabel: {
                      shrink: true,
                    },
  
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <AccessTimeOutlinedIcon fontSize="small" />
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              </Grid>
  
              <Grid
                size={{
                  xs: 12,
                  md: 5,
                }}
              >
                <TextField
                  select
                  fullWidth
                  label="Activity type"
                  name="activityType"
                  value={
                    formData.activityType
                  }
                  onChange={
                    handleChange
                  }
                  disabled={
                    loadingTypes
                  }
                >
                  {activityTypes.map(
                    (activity) => (
                      <MenuItem
                        key={
                          activity.id
                        }
                        value={String(
                          activity.id
                        )}
                      >
                        {activity.name}
                      </MenuItem>
                    )
                  )}
                </TextField>
              </Grid>
  
              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                  md: 3.5,
                }}
              >
                <TextField
                  fullWidth
                  label="Intensity"
                  value={
                    selectedActivityType
                      ?.intensity ||
                    selectedActivityType
                      ?.activity_intensity ||
                    "—"
                  }
                  disabled
                />
              </Grid>
  
              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                  md: 3.5,
                }}
              >
                <TextField
                  fullWidth
                  label="Duration"
                  name="duration"
                  type="number"
                  value={
                    formData.duration
                  }
                  onChange={
                    handleChange
                  }
                  slotProps={{
                    htmlInput: {
                      min: 0.5,
                      step: 0.5,
                    },
  
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <TimerOutlinedIcon fontSize="small" />
                        </InputAdornment>
                      ),
  
                      endAdornment: (
                        <InputAdornment position="end">
                          hours
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              </Grid>
            </Grid>
  
            <Box>
              <Typography
                fontWeight={800}
                sx={{ mb: 0.5 }}
              >
                Additional Factors
              </Typography>
  
              <Typography
                variant="body2"
                color="text.secondary"
              >
                These conditions are used
                by the risk engine.
              </Typography>
            </Box>
  
            <Grid
              container
              spacing={2.5}
            >
              <Grid
                size={{
                  xs: 12,
                  md: 4,
                }}
              >
                <FactorSection
                  icon={
                    <WbSunnyOutlinedIcon />
                  }
                  title="Sun exposure"
                >
                    <RadioGroup
                    name="sunExposure"
                    value={formData.sunExposure}
                    onChange={handleChange}
                    >
                    <FormControlLabel
                        value="DIRECT"
                        control={<Radio />}
                        label="Direct sunlight"
                    />

                    <FormControlLabel
                        value="MIXED"
                        control={<Radio />}
                        label="Mixed exposure"
                    />

                    <FormControlLabel
                        value="SHADED"
                        control={<Radio />}
                        label="Shaded"
                    />
                    </RadioGroup>
                </FactorSection>
              </Grid>
  
              <Grid
                size={{
                  xs: 12,
                  md: 4,
                }}
              >
                <FactorSection
                  icon={
                    <WaterDropOutlinedIcon />
                  }
                  title="Water availability"
                >
                  <RadioGroup
                    name="waterAvailable"
                    value={
                      formData.waterAvailable
                    }
                    onChange={
                      handleChange
                    }
                  >
                    <FormControlLabel
                      value="true"
                      control={<Radio />}
                      label="Available"
                    />
  
                    <FormControlLabel
                      value="false"
                      control={<Radio />}
                      label="Not available"
                    />
                  </RadioGroup>
                </FactorSection>
              </Grid>
  
              <Grid
                size={{
                  xs: 12,
                  md: 4,
                }}
              >
                <FactorSection
                  icon={
                    <WeekendOutlinedIcon />
                  }
                  title="Rest area"
                >
                  <RadioGroup
                    name="restAreaAvailable"
                    value={
                      formData.restAreaAvailable
                    }
                    onChange={
                      handleChange
                    }
                  >
                    <FormControlLabel
                      value="true"
                      control={<Radio />}
                      label="Available"
                    />
  
                    <FormControlLabel
                      value="false"
                      control={<Radio />}
                      label="Not available"
                    />
                  </RadioGroup>
                </FactorSection>
              </Grid>
            </Grid>
  
            <TextField
              select
              fullWidth
              label="Worker category"
              name="workerCategory"
              value={
                formData.workerCategory
              }
              onChange={handleChange}
            >
              {workerCategories.map(
                (category) => (
                  <MenuItem
                    key={category}
                    value={category}
                  >
                    {category}
                  </MenuItem>
                )
              )}
            </TextField>
  
            <TextField
              fullWidth
              multiline
              minRows={2}
              label="Notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Optional activity notes"
            />
  
            <Stack
              direction={{
                xs: "column-reverse",
                sm: "row",
              }}
              spacing={1.5}
              sx={{
                justifyContent:
                  "flex-end",
              }}
            >
              <Button
                variant="outlined"
                color="secondary"
                disabled={submitting}
                onClick={() =>
                  navigate(
                    "/supervisor/dashboard"
                  )
                }
              >
                Cancel
              </Button>
  
              <Button
                type="submit"
                variant="contained"
                disabled={
                  submitting ||
                  loadingTypes
                }
                sx={{
                  minWidth: 190,
                }}
              >
                {submitting ? (
                  <>
                    <CircularProgress
                      size={18}
                      color="inherit"
                      sx={{ mr: 1 }}
                    />
                    Assessing...
                  </>
                ) : (
                  "Assess Heat Risk"
                )}
              </Button>
            </Stack>
          </Stack>
        </Paper>
      </Box>
    );
  }
  
  
  function FactorSection({
    icon,
    title,
    children,
  }) {
    return (
      <Box
        sx={{
          height: "100%",
          p: 2,
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 2.5,
          bgcolor: "#FBFCFE",
        }}
      >
        <Stack
          direction="row"
          spacing={1}
          sx={{
            alignItems: "center",
            mb: 1,
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
            fontWeight={750}
          >
            {title}
          </Typography>
        </Stack>
  
        <FormControl>
          {children}
        </FormControl>
      </Box>
    );
  }