import {
    useEffect,
    useMemo,
    useState,
  } from "react";
  
  import {
    Alert,
    Avatar,
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
  
  import SearchRoundedIcon from
    "@mui/icons-material/SearchRounded";
  
  import {
    createUser,
    deleteUser,
    getUsers,
    updateUser,
  } from "../api/admin";
  
  
  const emptyForm = {
    first_name: "",
    last_name: "",
    email: "",
    role: "SUPERVISOR",
    is_active: true,
    password: "",
  };
  
  
  export default function ManageUsersPage() {
    const [users, setUsers] =
      useState([]);
  
    const [loading, setLoading] =
      useState(true);
  
    const [saving, setSaving] =
      useState(false);
  
    const [search, setSearch] =
      useState("");
  
    const [roleFilter, setRoleFilter] =
      useState("ALL");
  
    const [dialogOpen, setDialogOpen] =
      useState(false);
  
    const [editingUserId, setEditingUserId] =
      useState(null);
  
    const [formData, setFormData] =
      useState(emptyForm);
  
    const [message, setMessage] =
      useState("");
  
    const [error, setError] =
      useState("");
  
  
    useEffect(() => {
      loadUsers();
    }, []);
  
  
    const loadUsers = async () => {
      try {
        setLoading(true);
        setError("");
  
        const data = await getUsers();
  
        setUsers(data);
      } catch (err) {
        console.error(err);
  
        setError(
          "Unable to load users."
        );
      } finally {
        setLoading(false);
      }
    };
  
  
    const filteredUsers =
      useMemo(() => {
        const query =
          search.trim().toLowerCase();
  
        return users.filter((user) => {
          const fullName =
            `${user.first_name || ""} ${
              user.last_name || ""
            }`.toLowerCase();
  
          const email =
            user.email?.toLowerCase() || "";
  
          const matchesSearch =
            !query ||
            fullName.includes(query) ||
            email.includes(query);
  
          const matchesRole =
            roleFilter === "ALL" ||
            user.role === roleFilter;
  
          return (
            matchesSearch &&
            matchesRole
          );
        });
      }, [
        users,
        search,
        roleFilter,
      ]);
  
  
    const openCreateDialog = () => {
      setEditingUserId(null);
      setFormData(emptyForm);
      setError("");
      setDialogOpen(true);
    };
  
  
    const openEditDialog = (user) => {
      setEditingUserId(user.id);
  
      setFormData({
        first_name:
          user.first_name || "",
  
        last_name:
          user.last_name || "",
  
        email:
          user.email || "",
  
        role:
          user.role,
  
        is_active:
          user.is_active,
  
        password: "",
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
      if (
        !formData.email.trim() ||
        !formData.first_name.trim() ||
        !formData.last_name.trim()
      ) {
        setError(
          "First name, last name and email are required."
        );
  
        return;
      }
  
      if (
        !editingUserId &&
        !formData.password
      ) {
        setError(
          "Password is required when creating a user."
        );
  
        return;
      }
  
      try {
        setSaving(true);
        setError("");
  
        const payload = {
          first_name:
            formData.first_name.trim(),
  
          last_name:
            formData.last_name.trim(),
  
          email:
            formData.email.trim(),
  
          role:
            formData.role,
  
          is_active:
            formData.is_active,
        };
  
        if (formData.password) {
          payload.password =
            formData.password;
        }
  
        if (editingUserId) {
          const updated =
            await updateUser(
              editingUserId,
              payload
            );
  
          setUsers((current) =>
            current.map((user) =>
              user.id ===
              editingUserId
                ? updated
                : user
            )
          );
  
          setMessage(
            "User updated successfully."
          );
        } else {
          const created =
            await createUser(payload);
  
          setUsers((current) => [
            created,
            ...current,
          ]);
  
          setMessage(
            "User created successfully."
          );
        }
  
        setDialogOpen(false);
      } catch (err) {
        console.error(err);
  
        const data =
          err.response?.data;
  
        if (data) {
          setError(
            typeof data === "string"
              ? data
              : Object.entries(data)
                  .map(
                    ([field, value]) =>
                      `${field}: ${
                        Array.isArray(
                          value
                        )
                          ? value.join(" ")
                          : value
                      }`
                  )
                  .join(" ")
          );
        } else {
          setError(
            "Unable to save user."
          );
        }
      } finally {
        setSaving(false);
      }
    };
  
  
    const handleDelete = async (
      userId
    ) => {
      const confirmed =
        window.confirm(
          "Are you sure you want to delete this user?"
        );
  
      if (!confirmed) {
        return;
      }
  
      try {
        setError("");
  
        await deleteUser(userId);
  
        setUsers((current) =>
          current.filter(
            (user) =>
              user.id !== userId
          )
        );
  
        setMessage(
          "User deleted successfully."
        );
      } catch (err) {
        console.error(err);
  
        setError(
          "Unable to delete user."
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
              Manage Users
            </Typography>
  
            <Typography
              variant="body2"
              color="text.secondary"
            >
              Manage supervisor and
              administrator accounts.
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
            Add User
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
            p: 2.5,
            borderRadius: 3,
            mb: 2,
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
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search by name or email"
              sx={{ flex: 1 }}
              slotProps={{
                input: {
                  startAdornment: (
                    <SearchRoundedIcon
                      sx={{
                        mr: 1,
                        color:
                          "text.secondary",
                      }}
                    />
                  ),
                },
              }}
            />
  
            <TextField
              select
              label="Role"
              value={roleFilter}
              onChange={(event) =>
                setRoleFilter(
                  event.target.value
                )
              }
              sx={{
                minWidth: 200,
              }}
            >
              <MenuItem value="ALL">
                All roles
              </MenuItem>
  
              <MenuItem value="SUPERVISOR">
                Supervisor
              </MenuItem>
  
              <MenuItem value="ADMINISTRATOR">
                Administrator
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
                      User
                    </TableCell>
  
                    <TableCell>
                      Email
                    </TableCell>
  
                    <TableCell>
                      Role
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
                  {filteredUsers.map(
                    (user) => {
                      const initials =
                        `${
                          user.first_name?.[0] ||
                          ""
                        }${
                          user.last_name?.[0] ||
                          ""
                        }`.toUpperCase();
  
                      return (
                        <TableRow
                          key={user.id}
                          hover
                        >
                          <TableCell>
                            <Stack
                              direction="row"
                              spacing={1.5}
                              sx={{
                                alignItems:
                                  "center",
                              }}
                            >
                              <Avatar
                                sx={{
                                  bgcolor:
                                    "#FFE7DC",
  
                                  color:
                                    "primary.main",
  
                                  fontWeight:
                                    800,
                                }}
                              >
                                {initials ||
                                  "U"}
                              </Avatar>
  
                              <Typography
                                fontWeight={
                                  750
                                }
                              >
                                {user.first_name}{" "}
                                {user.last_name}
                              </Typography>
                            </Stack>
                          </TableCell>
  
                          <TableCell>
                            {user.email}
                          </TableCell>
  
                          <TableCell>
                            {user.role ===
                            "ADMINISTRATOR"
                              ? "Administrator"
                              : "Supervisor"}
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
  
                                fontSize: 12,
  
                                fontWeight:
                                  800,
  
                                bgcolor:
                                  user.is_active
                                    ? "#EAF8F1"
                                    : "#F1F3F5",
  
                                color:
                                  user.is_active
                                    ? "#16875D"
                                    : "#687078",
                              }}
                            >
                              {user.is_active
                                ? "ACTIVE"
                                : "INACTIVE"}
                            </Box>
                          </TableCell>
  
                          <TableCell align="right">
                            <Tooltip title="Edit user">
                              <IconButton
                                onClick={() =>
                                  openEditDialog(
                                    user
                                  )
                                }
                              >
                                <EditOutlinedIcon />
                              </IconButton>
                            </Tooltip>
  
                            <Tooltip title="Delete user">
                              <IconButton
                                color="error"
                                onClick={() =>
                                  handleDelete(
                                    user.id
                                  )
                                }
                              >
                                <DeleteOutlineRoundedIcon />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      );
                    }
                  )}
  
                  {!filteredUsers.length && (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        align="center"
                        sx={{ py: 6 }}
                      >
                        No users found.
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
            {editingUserId
              ? "Edit User"
              : "Add User"}
          </DialogTitle>
  
          <DialogContent>
            <Stack
              spacing={2.5}
              sx={{ mt: 1 }}
            >
              <Stack
                direction={{
                  xs: "column",
                  sm: "row",
                }}
                spacing={2}
              >
                <TextField
                  fullWidth
                  required
                  label="First name"
                  name="first_name"
                  value={
                    formData.first_name
                  }
                  onChange={
                    handleChange
                  }
                />
  
                <TextField
                  fullWidth
                  required
                  label="Last name"
                  name="last_name"
                  value={
                    formData.last_name
                  }
                  onChange={
                    handleChange
                  }
                />
              </Stack>
  
              <TextField
                fullWidth
                required
                type="email"
                label="Email"
                name="email"
                value={
                  formData.email
                }
                onChange={handleChange}
              />
  
              <TextField
                fullWidth
                label={
                  editingUserId
                    ? "New password (optional)"
                    : "Password"
                }
                name="password"
                type="password"
                value={
                  formData.password
                }
                onChange={handleChange}
                required={!editingUserId}
              />
  
              <TextField
                select
                fullWidth
                label="Role"
                name="role"
                value={formData.role}
                onChange={handleChange}
              >
                <MenuItem value="SUPERVISOR">
                  Supervisor
                </MenuItem>
  
                <MenuItem value="ADMINISTRATOR">
                  Administrator
                </MenuItem>
              </TextField>
  
              <TextField
                select
                fullWidth
                label="Status"
                name="is_active"
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
                : editingUserId
                  ? "Save Changes"
                  : "Create User"}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    );
  }