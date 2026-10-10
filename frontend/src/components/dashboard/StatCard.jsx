import {
    Box,
    Paper,
    Stack,
    Typography,
  } from "@mui/material";
  
  export default function StatCard({
    title,
    value,
    subtitle,
    icon,
    iconBackground = "#FFF1EB",
    iconColor = "#F4511E",
    children,
  }) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 2,
          borderRadius: 2.5,
          height: "100%",
        }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          spacing={2}
        >
          <Box>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 1.25 }}
            >
              {title}
            </Typography>
  
            <Typography
              variant="h5"
              fontWeight={800}
            >
              {value}
            </Typography>
  
            {subtitle && (
              <Typography
                variant="caption"
                color="text.secondary"
              >
                {subtitle}
              </Typography>
            )}
          </Box>
  
          {icon && (
            <Box
              sx={{
                width: 42,
                height: 42,
                borderRadius: 2,
                bgcolor: iconBackground,
                color: iconColor,
                display: "grid",
                placeItems: "center",
                flexShrink: 0,
              }}
            >
              {icon}
            </Box>
          )}
        </Stack>
  
        {children}
      </Paper>
    );
  }