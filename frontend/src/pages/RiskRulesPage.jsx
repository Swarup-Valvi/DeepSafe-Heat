import {
    useEffect,
    useState,
  } from "react";
  
  import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Divider,
    Grid,
    Paper,
    Stack,
    Switch,
    TextField,
    Typography,
  } from "@mui/material";
  
  import SaveRoundedIcon from
    "@mui/icons-material/SaveRounded";
  
  import {
    getRiskRules,
    updateRiskRule,
  } from "../api/admin";
  
  
  const emptyRules = {
    low_max: 3.9,
    moderate_max: 5.9,
    high_max: 7.9,
    very_high_min: 8,
  
    temperature_weight: 35,
    humidity_weight: 20,
    uv_weight: 20,
    activity_weight: 15,
    duration_weight: 10,
  
    use_feels_like: true,
    consider_sun_exposure: true,
    consider_water_availability: true,
    consider_rest_area: true,
  
    is_active: true,
  };
  
  
  export default function RiskRulesPage() {
    const [ruleId, setRuleId] =
      useState(null);
  
    const [rules, setRules] =
      useState(emptyRules);
  
    const [loading, setLoading] =
      useState(true);
  
    const [saving, setSaving] =
      useState(false);
  
    const [message, setMessage] =
      useState("");
  
    const [error, setError] =
      useState("");
  
  
    useEffect(() => {
      const loadRules = async () => {
        try {
          setLoading(true);
  
          const data =
            await getRiskRules();
  
          const activeRule =
            data.find(
              (rule) =>
                rule.is_active
            ) || data[0];
  
          if (!activeRule) {
            setError(
              "No risk rule exists in the database."
            );
  
            return;
          }
  
          setRuleId(activeRule.id);
  
          setRules({
            low_max:
              Number(
                activeRule.low_max
              ),
  
            moderate_max:
              Number(
                activeRule.moderate_max
              ),
  
            high_max:
              Number(
                activeRule.high_max
              ),
  
            very_high_min:
              Number(
                activeRule.very_high_min
              ),
  
            temperature_weight:
              activeRule.temperature_weight,
  
            humidity_weight:
              activeRule.humidity_weight,
  
            uv_weight:
              activeRule.uv_weight,
  
            activity_weight:
              activeRule.activity_weight,
  
            duration_weight:
              activeRule.duration_weight,
  
            use_feels_like:
              activeRule.use_feels_like,
  
            consider_sun_exposure:
              activeRule.consider_sun_exposure,
  
            consider_water_availability:
              activeRule.consider_water_availability,
  
            consider_rest_area:
              activeRule.consider_rest_area,
  
            is_active:
              activeRule.is_active,
          });
        } catch (err) {
          console.error(err);
  
          setError(
            "Unable to load risk rules."
          );
        } finally {
          setLoading(false);
        }
      };
  
      loadRules();
    }, []);
  
  
    const handleNumberChange = (
      event
    ) => {
      const {
        name,
        value,
      } = event.target;
  
      setRules((current) => ({
        ...current,
        [name]:
          value === ""
            ? ""
            : Number(value),
      }));
  
      setMessage("");
    };
  
  
    const handleSwitchChange = (
      event
    ) => {
      const {
        name,
        checked,
      } = event.target;
  
      setRules((current) => ({
        ...current,
        [name]: checked,
      }));
  
      setMessage("");
    };
  
  
    const totalWeight =
      Number(
        rules.temperature_weight
      ) +
      Number(
        rules.humidity_weight
      ) +
      Number(rules.uv_weight) +
      Number(
        rules.activity_weight
      ) +
      Number(
        rules.duration_weight
      );
  
  
    const handleSave = async () => {
      if (!ruleId) {
        return;
      }
  
      if (totalWeight !== 100) {
        setError(
          "Risk factor weights must total 100%."
        );
  
        return;
      }
  
      if (
        Number(rules.low_max) >=
          Number(
            rules.moderate_max
          ) ||
        Number(
          rules.moderate_max
        ) >=
          Number(rules.high_max) ||
        Number(rules.high_max) >=
          Number(
            rules.very_high_min
          )
      ) {
        setError(
          "Risk thresholds must increase from Low → Moderate → High → Very High."
        );
  
        return;
      }
  
      try {
        setSaving(true);
        setError("");
  
        const updated =
          await updateRiskRule(
            ruleId,
            rules
          );
  
        setRules({
          ...rules,
  
          low_max:
            Number(updated.low_max),
  
          moderate_max:
            Number(
              updated.moderate_max
            ),
  
          high_max:
            Number(updated.high_max),
  
          very_high_min:
            Number(
              updated.very_high_min
            ),
        });
  
        setMessage(
          "Risk rules updated successfully."
        );
      } catch (err) {
        console.error(err);
  
        const data =
          err.response?.data;
  
        setError(
          data
            ? JSON.stringify(data)
            : "Unable to update risk rules."
        );
      } finally {
        setSaving(false);
      }
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
              Risk Rules
            </Typography>
  
            <Typography
              variant="body2"
              color="text.secondary"
            >
              Configure the rule-based
              heat-risk calculation.
            </Typography>
          </Box>
  
          <Button
            variant="contained"
            startIcon={
              saving ? (
                <CircularProgress
                  size={18}
                  color="inherit"
                />
              ) : (
                <SaveRoundedIcon />
              )
            }
            disabled={
              saving ||
              !ruleId ||
              totalWeight !== 100
            }
            onClick={handleSave}
          >
            {saving
              ? "Saving..."
              : "Save Rules"}
          </Button>
        </Stack>
  
  
        {message && (
          <Alert
            severity="success"
            sx={{ mb: 2 }}
          >
            {message}
          </Alert>
        )}
  
  
        {error && (
          <Alert
            severity="error"
            onClose={() =>
              setError("")
            }
            sx={{ mb: 2 }}
          >
            {error}
          </Alert>
        )}
  
  
        {totalWeight !== 100 && (
          <Alert
            severity="warning"
            sx={{ mb: 2 }}
          >
            Risk factor weights total{" "}
            {totalWeight}%. They must
            equal 100%.
          </Alert>
        )}
  
  
        <Grid
          container
          spacing={2.5}
        >
          <Grid
            size={{
              xs: 12,
              lg: 6,
            }}
          >
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3,
                height: "100%",
              }}
            >
              <Typography
                variant="h6"
                fontWeight={800}
              >
                Risk Score Thresholds
              </Typography>
  
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 3 }}
              >
                Define the limits for
                each heat-risk category.
              </Typography>
  
              <Stack spacing={2.5}>
                <NumberField
                  label="Low risk maximum"
                  name="low_max"
                  value={rules.low_max}
                  onChange={
                    handleNumberChange
                  }
                />
  
                <NumberField
                  label="Moderate risk maximum"
                  name="moderate_max"
                  value={
                    rules.moderate_max
                  }
                  onChange={
                    handleNumberChange
                  }
                />
  
                <NumberField
                  label="High risk maximum"
                  name="high_max"
                  value={rules.high_max}
                  onChange={
                    handleNumberChange
                  }
                />
  
                <NumberField
                  label="Very high risk minimum"
                  name="very_high_min"
                  value={
                    rules.very_high_min
                  }
                  onChange={
                    handleNumberChange
                  }
                />
              </Stack>
            </Paper>
          </Grid>
  
  
          <Grid
            size={{
              xs: 12,
              lg: 6,
            }}
          >
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3,
                height: "100%",
              }}
            >
              <Stack
                direction="row"
                sx={{
                  justifyContent:
                    "space-between",
                  alignItems:
                    "center",
                  mb: 0.5,
                }}
              >
                <Typography
                  variant="h6"
                  fontWeight={800}
                >
                  Risk Factor Weights
                </Typography>
  
                <Typography
                  fontWeight={800}
                  color={
                    totalWeight === 100
                      ? "success.main"
                      : "warning.main"
                  }
                >
                  {totalWeight}%
                </Typography>
              </Stack>
  
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 3 }}
              >
                Weights determine each
                factor's contribution to
                the final score.
              </Typography>
  
              <Stack spacing={2.5}>
                <WeightField
                  label="Temperature"
                  name="temperature_weight"
                  value={
                    rules.temperature_weight
                  }
                  onChange={
                    handleNumberChange
                  }
                />
  
                <WeightField
                  label="Humidity"
                  name="humidity_weight"
                  value={
                    rules.humidity_weight
                  }
                  onChange={
                    handleNumberChange
                  }
                />
  
                <WeightField
                  label="UV index"
                  name="uv_weight"
                  value={
                    rules.uv_weight
                  }
                  onChange={
                    handleNumberChange
                  }
                />
  
                <WeightField
                  label="Activity intensity"
                  name="activity_weight"
                  value={
                    rules.activity_weight
                  }
                  onChange={
                    handleNumberChange
                  }
                />
  
                <WeightField
                  label="Activity duration"
                  name="duration_weight"
                  value={
                    rules.duration_weight
                  }
                  onChange={
                    handleNumberChange
                  }
                />
              </Stack>
            </Paper>
          </Grid>
  
  
          <Grid size={{ xs: 12 }}>
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
                Additional Assessment
                Rules
              </Typography>
  
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 2 }}
              >
                Enable or disable
                factors used by the risk
                engine.
              </Typography>
  
              <Stack
                divider={
                  <Divider flexItem />
                }
              >
                <RuleSwitch
                  label="Use feels-like temperature"
                  description="Use apparent temperature when available."
                  name="use_feels_like"
                  checked={
                    rules.use_feels_like
                  }
                  onChange={
                    handleSwitchChange
                  }
                />
  
                <RuleSwitch
                  label="Consider sun exposure"
                  description="Include sun exposure in the assessment."
                  name="consider_sun_exposure"
                  checked={
                    rules.consider_sun_exposure
                  }
                  onChange={
                    handleSwitchChange
                  }
                />
  
                <RuleSwitch
                  label="Consider water availability"
                  description="Account for drinking-water availability."
                  name="consider_water_availability"
                  checked={
                    rules.consider_water_availability
                  }
                  onChange={
                    handleSwitchChange
                  }
                />
  
                <RuleSwitch
                  label="Consider rest-area availability"
                  description="Account for access to a rest area."
                  name="consider_rest_area"
                  checked={
                    rules.consider_rest_area
                  }
                  onChange={
                    handleSwitchChange
                  }
                />
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    );
  }
  
  
  function NumberField({
    label,
    name,
    value,
    onChange,
  }) {
    return (
      <TextField
        fullWidth
        label={label}
        name={name}
        type="number"
        value={value}
        onChange={onChange}
        slotProps={{
          htmlInput: {
            min: 0,
            max: 10,
            step: 0.1,
          },
        }}
      />
    );
  }
  
  
  function WeightField({
    label,
    name,
    value,
    onChange,
  }) {
    return (
      <Stack
        direction="row"
        spacing={2}
        sx={{
          alignItems: "center",
        }}
      >
        <Typography
          variant="body2"
          sx={{ flex: 1 }}
        >
          {label}
        </Typography>
  
        <TextField
          name={name}
          type="number"
          value={value}
          onChange={onChange}
          size="small"
          sx={{
            width: 120,
          }}
          slotProps={{
            htmlInput: {
              min: 0,
              max: 100,
            },
          }}
        />
      </Stack>
    );
  }
  
  
  function RuleSwitch({
    label,
    description,
    name,
    checked,
    onChange,
  }) {
    return (
      <Stack
        direction="row"
        spacing={2}
        sx={{
          justifyContent:
            "space-between",
          alignItems: "center",
          py: 2,
        }}
      >
        <Box>
          <Typography
            fontWeight={750}
          >
            {label}
          </Typography>
  
          <Typography
            variant="body2"
            color="text.secondary"
          >
            {description}
          </Typography>
        </Box>
  
        <Switch
          name={name}
          checked={checked}
          onChange={onChange}
        />
      </Stack>
    );
  }