import { Box, Paper, Typography } from "@mui/material";

export default function SectionCard({
  title,
  action,
  children,
  sx,
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        borderRadius: 2.5,
        ...sx,
      }}
    >
      {(title || action) && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 2,
          }}
        >
          <Typography fontWeight={750}>
            {title}
          </Typography>

          {action}
        </Box>
      )}

      {children}
    </Paper>
  );
}