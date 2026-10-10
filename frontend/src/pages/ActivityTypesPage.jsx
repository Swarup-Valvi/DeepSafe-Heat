import {
    useEffect,
    useState,
  } from "react";
  
  import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
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
  
  import AddRoundedIcon from
    "@mui/icons-material/AddRounded";
  
  import EditOutlinedIcon from
    "@mui/icons-material/EditOutlined";
  
  import DeleteOutlineRoundedIcon from
    "@mui/icons-material/DeleteOutlineRounded";
  
  import {
    createActivityType,
    deleteActivityType,
    getActivityTypes,
    updateActivityType,
  } from "../api/activities";
  
  
  const emptyForm = {
    name: "",
    intensity: "MODERATE",
    default_exposure: "DIRECT",
    default_duration: 1,
    is_active: true,
  };
  
  
  function exposureLabel(value) {
    const labels = {
      DIRECT: "Direct sunlight",
      MIXED: "Mixed exposure",
      SHADED: "Shaded",
    };
  
    return labels[value] || value;
  }
  
  
  export default function ActivityTypesPage() {
    const [
      activityTypes,
      setActivityTypes,
    ] = useState([]);
  
    const [loading, setLoading] =
      useState(true);
  
    const [saving, setSaving] =
      useState(false);
  
    const [dialogOpen, setDialogOpen] =
      useState(false);
  
    const [editingId, setEditingId] =
      useState(null);
  
    const [formData, setFormData] =
      useState(emptyForm);
  
    const [message, setMessage] =
      useState("");
  
    const [error, setError] =
      useState("");
  
  
    useEffect(() => {
      loadActivityTypes();
    }, []);
  
  
    const loadActivityTypes =
      async () => {
        try {
          setLoading(true);
          setError("");
  
          const data =
            await getActivityTypes();
  
          setActivityTypes(data);
        } catch (err) {
          console.error(err);
  
          setError(
            "Unable to load activity types."
          );
        } finally {
          setLoading(false);
        }
      };
  
  
    const openCreateDialog = () => {
      setEditingId(null);
      setFormData(emptyForm);
      setError("");
      setDialogOpen(true);
    };
  
  
    const openEditDialog = (
      activity
    ) => {
      setEditingId(activity.id);
  
      setFormData({
        name:
          activity.name,
  
        intensity:
          activity.intensity,
  
        default_exposure:
          activity.default_exposure,
  
        default_duration:
          activity.default_duration,
  
        is_active:
          activity.is_active,
      });
  
      setError("");
      setDialogOpen(true);
    };
  
  
    const handleChange = (event) => {
      const {
        name,
        value,
      } = event.target;
  
      setFormData((current) => ({
        ...current,
        [name]: value,
      }));
    };
  
  
    const handleSave = async () => {
      if (!formData.name.trim()) {
        setError(
          "Activity name is required."
        );
  
        return;
      }
  
      try {
        setSaving(true);
        setError("");
  
        const payload = {
          name:
            formData.name.trim(),
  
          intensity:
            formData.intensity,
  
          default_exposure:
            formData.default_exposure,
  
          default_duration:
            Number(
              formData.default_duration
            ),
  
          is_active:
            formData.is_active,
        };
  
        if (editingId) {
          const updated =
            await updateActivityType(
              editingId,
              payload
            );
  
          setActivityTypes(
            (current) =>
              current.map(
                (activity) =>
                  activity.id ===
                  editingId
                    ? updated
                    : activity
              )
          );
  
          setMessage(
            "Activity type updated successfully."
          );
        } else {
          const created =
            await createActivityType(
              payload
            );
  
          setActivityTypes(
            (current) => [
              created,
              ...current,
            ]
          );
  
          setMessage(
            "Activity type created successfully."
          );
        }
  
        setDialogOpen(false);
      } catch (err) {
        console.error(err);
  
        setError(
          "Unable to save activity type."
        );
      } finally {
        setSaving(false);
      }
    };
  
  
    const handleDelete = async (
      id
    ) => {
      const confirmed =
        window.confirm(
          "Are you sure you want to delete this activity type?"
        );
  
      if (!confirmed) {
        return;
      }
  
      try {
        await deleteActivityType(id);
  
        setActivityTypes(
          (current) =>
            current.filter(
              (activity) =>
                activity.id !== id
            )
        );
  
        setMessage(
          "Activity type deleted successfully."
        );
      } catch (err) {
        console.error(err);
  
        setError(
          "Unable to delete activity type. It may already be used by planned activities."
        );
      }
    };
  
  
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
              Activity Types
            </Typography>
  
            <Typography
              variant="body2"
              color="text.secondary"
            >
              Configure activity
              categories used by the
              heat-risk engine.
            </Typography>
          </Box>
  
          <Button
            variant="contained"
            startIcon={
              <AddRoundedIcon />
            }
            onClick={
              openCreateDialog
            }
          >
            Add Activity Type
          </Button>
        </Stack>
  
  
        {message && (
          <Alert
            severity="success"
            onClose={() =>
              setMessage("")
            }
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
                      Activity
                    </TableCell>
  
                    <TableCell>
                      Intensity
                    </TableCell>
  
                    <TableCell>
                      Sun exposure
                    </TableCell>
  
                    <TableCell>
                      Default duration
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
                  {activityTypes.map(
                    (activity) => (
                      <TableRow
                        key={
                          activity.id
                        }
                        hover
                      >
                        <TableCell>
                          <Typography
                            fontWeight={
                              750
                            }
                          >
                            {
                              activity.name
                            }
                          </Typography>
                        </TableCell>
  
                        <TableCell>
                          {
                            activity.intensity
                          }
                        </TableCell>
  
                        <TableCell>
                          {exposureLabel(
                            activity.default_exposure
                          )}
                        </TableCell>
  
                        <TableCell>
                          {
                            activity.default_duration
                          }{" "}
                          hours
                        </TableCell>
  
                        <TableCell>
                          <Box
                            component="span"
                            sx={{
                              display:
                                "inline-flex",
  
                              px: 1.25,
                              py: 0.5,
  
                              borderRadius:
                                10,
  
                              fontSize:
                                12,
  
                              fontWeight:
                                800,
  
                              bgcolor:
                                activity.is_active
                                  ? "#EAF8F1"
                                  : "#F1F3F5",
  
                              color:
                                activity.is_active
                                  ? "#16875D"
                                  : "#687078",
                            }}
                          >
                            {activity.is_active
                              ? "ACTIVE"
                              : "INACTIVE"}
                          </Box>
                        </TableCell>
  
                        <TableCell align="right">
                          <Tooltip title="Edit">
                            <IconButton
                              onClick={() =>
                                openEditDialog(
                                  activity
                                )
                              }
                            >
                              <EditOutlinedIcon />
                            </IconButton>
                          </Tooltip>
  
                          <Tooltip title="Delete">
                            <IconButton
                              color="error"
                              onClick={() =>
                                handleDelete(
                                  activity.id
                                )
                              }
                            >
                              <DeleteOutlineRoundedIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    )
                  )}
  
                  {!activityTypes.length && (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        align="center"
                        sx={{ py: 6 }}
                      >
                        No activity types
                        found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
  
  
        <Dialog
          open={dialogOpen}
          onClose={() =>
            !saving &&
            setDialogOpen(false)
          }
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>
            {editingId
              ? "Edit Activity Type"
              : "Add Activity Type"}
          </DialogTitle>
  
          <DialogContent>
            <Stack
              spacing={2.5}
              sx={{ mt: 1 }}
            >
              <TextField
                fullWidth
                required
                label="Activity name"
                name="name"
                value={
                  formData.name
                }
                onChange={handleChange}
              />
  
              <TextField
                select
                fullWidth
                label="Intensity"
                name="intensity"
                value={
                  formData.intensity
                }
                onChange={handleChange}
              >
                <MenuItem value="LOW">
                  Low
                </MenuItem>
  
                <MenuItem value="MODERATE">
                  Moderate
                </MenuItem>
  
                <MenuItem value="HIGH">
                  High
                </MenuItem>
              </TextField>
  
              <TextField
                select
                fullWidth
                label="Sun exposure"
                name="default_exposure"
                value={
                  formData.default_exposure
                }
                onChange={handleChange}
              >
                <MenuItem value="DIRECT">
                  Direct sunlight
                </MenuItem>
  
                <MenuItem value="MIXED">
                  Mixed exposure
                </MenuItem>
  
                <MenuItem value="SHADED">
                  Shaded
                </MenuItem>
              </TextField>
  
              <TextField
                fullWidth
                label="Default duration"
                name="default_duration"
                type="number"
                value={
                  formData.default_duration
                }
                onChange={handleChange}
                slotProps={{
                  htmlInput: {
                    min: 0.5,
                    max: 24,
                    step: 0.5,
                  },
                }}
              />
  
              <TextField
                select
                fullWidth
                label="Status"
                value={
                  formData.is_active
                    ? "ACTIVE"
                    : "INACTIVE"
                }
                onChange={(event) =>
                  setFormData(
                    (current) => ({
                      ...current,
  
                      is_active:
                        event.target
                          .value ===
                        "ACTIVE",
                    })
                  )
                }
              >
                <MenuItem value="ACTIVE">
                  Active
                </MenuItem>
  
                <MenuItem value="INACTIVE">
                  Inactive
                </MenuItem>
              </TextField>
            </Stack>
          </DialogContent>
  
          <DialogActions
            sx={{ p: 2.5 }}
          >
            <Button
              color="secondary"
              disabled={saving}
              onClick={() =>
                setDialogOpen(false)
              }
            >
              Cancel
            </Button>
  
            <Button
              variant="contained"
              disabled={saving}
              onClick={handleSave}
            >
              {saving
                ? "Saving..."
                : editingId
                  ? "Save Changes"
                  : "Create Activity"}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    );
  }