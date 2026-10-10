import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light",

    primary: {
      main: "#F4511E",
      dark: "#D83A0E",
      light: "#FFF1EB",
      contrastText: "#FFFFFF",
    },

    secondary: {
      main: "#172033",
    },

    background: {
      default: "#F5F7FA",
      paper: "#FFFFFF",
    },

    text: {
      primary: "#172033",
      secondary: "#667085",
    },

    success: {
      main: "#22A06B",
      light: "#EAF8F1",
    },

    warning: {
      main: "#F5A623",
      light: "#FFF6DF",
    },

    error: {
      main: "#E5484D",
      light: "#FDECEC",
    },

    divider: "#E7EAF0",
  },

  typography: {
    fontFamily: [
      "Inter",
      "-apple-system",
      "BlinkMacSystemFont",
      '"Segoe UI"',
      "sans-serif",
    ].join(","),

    h1: {
      fontWeight: 800,
    },

    h2: {
      fontWeight: 800,
    },

    h3: {
      fontWeight: 800,
    },

    h4: {
      fontWeight: 800,
    },

    h5: {
      fontWeight: 750,
    },

    h6: {
      fontWeight: 700,
    },

    button: {
      textTransform: "none",
      fontWeight: 700,
    },
  },

  shape: {
    borderRadius: 12,
  },

  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: "#F5F7FA",
        },
      },
    },

    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          border: "1px solid #E7EAF0",
          boxShadow: "0 2px 8px rgba(20, 30, 55, 0.04)",
        },
      },
    },

    MuiButton: {
      styleOverrides: {
        root: {
          minHeight: 42,
          borderRadius: 8,
          paddingLeft: 18,
          paddingRight: 18,
          boxShadow: "none",
        },
      },
    },

    MuiTextField: {
      defaultProps: {
        fullWidth: true,
        size: "small",
      },
    },

    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          backgroundColor: "#FFFFFF",
        },
      },
    },

    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 700,
        },
      },
    },
  },
});

export default theme;