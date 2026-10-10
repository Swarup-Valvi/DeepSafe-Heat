import {
    Box,
    Button,
    Typography,
  } from "@mui/material";
  
  import { useNavigate } from "react-router";
  
  export default function NotFoundPage() {
    const navigate = useNavigate();
  
    return (
      <Box
        sx={{
          minHeight: "70vh",
          display: "grid",
          placeItems: "center",
          textAlign: "center",
        }}
      >
        <Box>
          <Typography
            variant="h2"
            fontWeight={800}
          >
            404
          </Typography>
  
          <Typography
            variant="h5"
            gutterBottom
          >
            Page not found
          </Typography>
  
          <Button
            variant="contained"
            onClick={() => navigate("/")}
          >
            Return home
          </Button>
        </Box>
      </Box>
    );
  }