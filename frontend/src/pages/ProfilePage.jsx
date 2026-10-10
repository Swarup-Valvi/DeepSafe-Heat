import { useEffect, useState } from "react";

import {
  Alert,
  Avatar,
  Box,
  Button,
  Grid,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import SaveRoundedIcon from
  "@mui/icons-material/SaveRounded";
import PersonOutlineRoundedIcon from
  "@mui/icons-material/PersonOutlineRounded";

import { useAuth } from "../context/AuthContext";

export default function ProfilePage() {
  const { user } = useAuth();

  const [formData, setFormData] =
    useState({
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      jobTitle: "Site Supervisor",
      department: "Field Operations",
    });

  const [saved, setSaved] =
    useState(false);

  useEffect(() => {
    if (!user) {
      return;
    }

    setFormData((current) => ({
      ...current,
      first_name:
        user.first_name || "",
      last_name:
        user.last_name || "",
      email:
        user.email || "",
    }));
  }, [user]);

  const handleChange = (event) => {
    const { name, value } =
      event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    setSaved(false);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    localStorage.setItem(
      "heatsafe_profile",
      JSON.stringify(formData)
    );

    setSaved(true);
  };

  const initials = `${
    formData.first_name?.[0] || ""
  }${
    formData.last_name?.[0] || ""
  }`.toUpperCase();

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h4"
          fontWeight={800}
        >
          Profile
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
        >
          View and update your account information.
        </Typography>
      </Box>

      {saved && (
        <Alert
          severity="success"
          sx={{ mb: 2 }}
        >
          Profile updated successfully.
        </Alert>
      )}

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
          maxWidth: 1050,
        }}
      >
        <Grid container spacing={4}>
          <Grid
            size={{
              xs: 12,
              md: 4,
            }}
          >
            <Stack
              alignItems="center"
              textAlign="center"
            >
              <Avatar
                sx={{
                  width: 110,
                  height: 110,
                  bgcolor: "#FFE7DC",
                  color: "primary.main",
                  fontSize: 36,
                  fontWeight: 800,
                  mb: 2,
                }}
              >
                {initials || (
                  <PersonOutlineRoundedIcon
                    fontSize="large"
                  />
                )}
              </Avatar>

              <Typography
                variant="h6"
                fontWeight={800}
              >
                {formData.first_name}{" "}
                {formData.last_name}
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
              >
                {user?.role ===
                "ADMINISTRATOR"
                  ? "Administrator"
                  : "Supervisor"}
              </Typography>

            </Stack>
          </Grid>

          <Grid
            size={{
              xs: 12,
              md: 8,
            }}
          >
            <Grid container spacing={2.5}>
              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                }}
              >
                <TextField
                  label="First name"
                  name="first_name"
                  value={
                    formData.first_name
                  }
                  onChange={handleChange}
                  required
                />
              </Grid>

              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                }}
              >
                <TextField
                  label="Last name"
                  name="last_name"
                  value={
                    formData.last_name
                  }
                  onChange={handleChange}
                  required
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  label="Email address"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled
                />
              </Grid>

              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                }}
              >
                <TextField
                  label="Phone number"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 98765 43210"
                />
              </Grid>

              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                }}
              >
                <TextField
                  label="Job title"
                  name="jobTitle"
                  value={
                    formData.jobTitle
                  }
                  onChange={handleChange}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  label="Department / Team"
                  name="department"
                  value={
                    formData.department
                  }
                  onChange={handleChange}
                />
              </Grid>
            </Grid>

            <Stack
              direction="row"
              justifyContent="flex-end"
              sx={{ mt: 3 }}
            >
              <Button
                type="submit"
                variant="contained"
                startIcon={
                  <SaveRoundedIcon />
                }
              >
                Update Profile
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
}