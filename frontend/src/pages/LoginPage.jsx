import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router";

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import LocalFireDepartmentRoundedIcon from
  "@mui/icons-material/LocalFireDepartmentRounded";

import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const navigate = useNavigate();
  const {
    user,
    isAuthenticated,
    login,
  } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated && user) {
    const destination =
      user.role === "ADMINISTRATOR"
        ? "/admin/dashboard"
        : "/supervisor/dashboard";

    return <Navigate to={destination} replace />;
  }

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSubmitting(true);

    try {
      const authenticatedUser = await login(
        formData.email,
        formData.password
      );

      const destination =
        authenticatedUser.role === "ADMINISTRATOR"
          ? "/admin/dashboard"
          : "/supervisor/dashboard";

      navigate(destination, { replace: true });
    } catch (requestError) {
      const responseData = requestError.response?.data;

      const message =
        responseData?.non_field_errors?.[0] ||
        responseData?.detail ||
        "Invalid email or password.";

      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #F0FDF4 0%, #F8FAFC 60%, #FFF7ED 100%)",
        display: "flex",
        alignItems: "center",
        py: 5,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={0}
          sx={{
            p: {
              xs: 3,
              sm: 5,
            },
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Stack spacing={3}>
            <Stack
              direction="row"
              spacing={1.5}
              alignItems="center"
            >
              <Box
                sx={{
                  width: 46,
                  height: 46,
                  borderRadius: 2.5,
                  display: "grid",
                  placeItems: "center",
                  bgcolor: "primary.main",
                  color: "primary.contrastText",
                }}
              >
                <LocalFireDepartmentRoundedIcon />
              </Box>

              <Box>
                <Typography
                  variant="h5"
                  fontWeight={800}
                >
                  HeatSafe
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  Outdoor heat-risk planning
                </Typography>
              </Box>
            </Stack>

            <Box>
              <Typography
                variant="h4"
                fontWeight={750}
                gutterBottom
              >
                Welcome back
              </Typography>

              <Typography color="text.secondary">
                Sign in to manage outdoor activities and
                assess heat risk.
              </Typography>
            </Box>

            {error && (
              <Alert severity="error">
                {error}
              </Alert>
            )}

            <Box
              component="form"
              onSubmit={handleSubmit}
            >
              <Stack spacing={2.5}>
                <TextField
                  label="Email address"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                  required
                />

                <TextField
                  label="Password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  required
                />

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={submitting}
                >
                  {submitting ? (
                    <CircularProgress
                      size={22}
                      color="inherit"
                    />
                  ) : (
                    "Sign in"
                  )}
                </Button>
              </Stack>
            </Box>

            <Typography
              align="center"
              color="text.secondary"
            >
              New supervisor?{" "}
              <Link to="/register">
                Create an account
              </Link>
            </Typography>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}