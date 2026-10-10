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

import { useAuth } from "../context/AuthContext";

export default function RegisterPage() {
  const navigate = useNavigate();

  const {
    user,
    isAuthenticated,
    register,
  } = useAuth();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    password: "",
    confirm_password: "",
  });

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated && user) {
    return (
      <Navigate
        to="/supervisor/dashboard"
        replace
      />
    );
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
      await register(formData);

      navigate("/supervisor/dashboard", {
        replace: true,
      });
    } catch (requestError) {
      const responseData = requestError.response?.data;

      if (responseData) {
        const firstKey = Object.keys(responseData)[0];
        const firstValue = responseData[firstKey];

        setError(
          Array.isArray(firstValue)
            ? firstValue[0]
            : firstValue
        );
      } else {
        setError(
          "Registration failed. Check that the backend is running."
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
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
            <Box>
              <Typography
                variant="h4"
                fontWeight={750}
                gutterBottom
              >
                Create supervisor account
              </Typography>

              <Typography color="text.secondary">
                Register to plan activities and review
                heat-risk assessments.
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
              <Stack spacing={2}>
                <Stack
                  direction={{
                    xs: "column",
                    sm: "row",
                  }}
                  spacing={2}
                >
                  <TextField
                    label="First name"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    required
                  />

                  <TextField
                    label="Last name"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    required
                  />
                </Stack>

                <TextField
                  label="Username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />

                <TextField
                  label="Email address"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />

                <TextField
                  label="Password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />

                <TextField
                  label="Confirm password"
                  name="confirm_password"
                  type="password"
                  value={formData.confirm_password}
                  onChange={handleChange}
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
                    "Create account"
                  )}
                </Button>
              </Stack>
            </Box>

            <Typography
              align="center"
              color="text.secondary"
            >
              Already registered?{" "}
              <Link to="/login">
                Sign in
              </Link>
            </Typography>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}