import { useState } from "react";
import {
  NavLink,
  Outlet,
  useNavigate,
} from "react-router-dom";

import {
  AppBar,
  Avatar,
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";

import DashboardRoundedIcon from
  "@mui/icons-material/DashboardRounded";
import EventNoteRoundedIcon from
  "@mui/icons-material/EventNoteRounded";
import HistoryRoundedIcon from
  "@mui/icons-material/HistoryRounded";
import AssessmentRoundedIcon from
  "@mui/icons-material/AssessmentRounded";
import LogoutRoundedIcon from
  "@mui/icons-material/LogoutRounded";
import MenuRoundedIcon from
  "@mui/icons-material/MenuRounded";
import LocalFireDepartmentRoundedIcon from
  "@mui/icons-material/LocalFireDepartmentRounded";
import ManageAccountsRoundedIcon from
  "@mui/icons-material/ManageAccountsRounded";
import StorageRoundedIcon from
  "@mui/icons-material/StorageRounded";
import NotificationsNoneRoundedIcon from
  "@mui/icons-material/NotificationsNoneRounded";
import CloudQueueRoundedIcon from
  "@mui/icons-material/CloudQueueRounded";
import WarningAmberRoundedIcon from
  "@mui/icons-material/WarningAmberRounded";
import PersonOutlineRoundedIcon from
  "@mui/icons-material/PersonOutlineRounded";

import { useAuth } from "../context/AuthContext";

const drawerWidth = 230;

const supervisorLinks = [
  {
    label: "Dashboard",
    path: "/supervisor/dashboard",
    icon: <DashboardRoundedIcon />,
  },
  {
    label: "Plan Activity",
    path: "/supervisor/plan-activity",
    icon: <EventNoteRoundedIcon />,
  },
  {
    label: "Activity History",
    path: "/supervisor/history",
    icon: <HistoryRoundedIcon />,
  },
  {
    label: "Weather",
    path: "/supervisor/weather",
    icon: <CloudQueueRoundedIcon />,
  },
  {
    label: "Alerts",
    path: "/supervisor/alerts",
    icon: <WarningAmberRoundedIcon />,
  },
  {
    label: "Reports",
    path: "/supervisor/reports",
    icon: <AssessmentRoundedIcon />,
  },
  {
    label: "Profile",
    path: "/supervisor/profile",
    icon: <PersonOutlineRoundedIcon />,
  },
];

const adminLinks = [
  {
    label: "Dashboard",
    path: "/admin/dashboard",
    icon: <DashboardRoundedIcon />,
  },
  {
    label: "Users",
    path: "/admin/users",
    icon: <ManageAccountsRoundedIcon />,
  },
  {
    label: "Weather Data",
    path: "/admin/weather-data",
    icon: <StorageRoundedIcon />,
  },
  {
    label: "Activity Types",
    path: "/admin/activity-types",
    icon: <EventNoteRoundedIcon />,
  },
  {
    label: "Risk Rules",
    path: "/admin/risk-rules",
    icon: <WarningAmberRoundedIcon />,
  },
];

export default function AppLayout() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [mobileOpen, setMobileOpen] =
    useState(false);

  const links =
    user?.role === "ADMINISTRATOR"
      ? adminLinks
      : supervisorLinks;

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  const drawerContent = (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        bgcolor: "#182235",
        color: "#FFFFFF",
      }}
    >
      <Toolbar
        sx={{
          minHeight: "72px !important",
          px: 2.25,
        }}
      >
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
        >
          <LocalFireDepartmentRoundedIcon
            sx={{ color: "#FF6A2A" }}
          />

          <Typography
            variant="h6"
            fontWeight={800}
          >
            HeatSafe
          </Typography>
        </Stack>
      </Toolbar>

      <Divider
        sx={{
          borderColor: "rgba(255,255,255,0.08)",
        }}
      />

      <List sx={{ px: 1.25, py: 2 }}>
        {links.map((item) => (
          <ListItemButton
            key={item.path}
            component={NavLink}
            to={item.path}
            onClick={() => setMobileOpen(false)}
            sx={{
              color: "rgba(255,255,255,0.74)",
              borderRadius: 1.5,
              mb: 0.5,
              minHeight: 44,

              "& .MuiListItemIcon-root": {
                color: "inherit",
              },

              "&.active": {
                bgcolor: "#F4511E",
                color: "#FFFFFF",
              },

              "&:hover": {
                bgcolor: "rgba(255,255,255,0.08)",
              },

              "&.active:hover": {
                bgcolor: "#F4511E",
              },
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 38,
              }}
            >
              {item.icon}
            </ListItemIcon>

            <ListItemText
            primary={item.label}
            slotProps={{
                primary: {
                sx: {
                    fontSize: 14,
                    fontWeight: 600,
                },
                },
            }}
            />
          </ListItemButton>
        ))}
      </List>

      <Box sx={{ mt: "auto", p: 1.5 }}>
        <Divider
          sx={{
            mb: 1.5,
            borderColor: "rgba(255,255,255,0.08)",
          }}
        />

        <ListItemButton
          onClick={handleLogout}
          sx={{
            color: "rgba(255,255,255,0.74)",
            borderRadius: 1.5,

            "&:hover": {
              bgcolor: "rgba(255,255,255,0.08)",
            },
          }}
        >
          <ListItemIcon
            sx={{
              minWidth: 38,
              color: "inherit",
            }}
          >
            <LogoutRoundedIcon />
          </ListItemIcon>

          <ListItemText
            primary="Sign out"
            slotProps={{
                primary: {
                sx: {
                    fontSize: 14,
                    fontWeight: 600,
                },
                },
            }}
            />
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        bgcolor: "background.default",
      }}
    >
      <Box
        component="nav"
        sx={{
          width: {
            md: drawerWidth,
          },
          flexShrink: {
            md: 0,
          },
        }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: {
              xs: "block",
              md: "none",
            },

            "& .MuiDrawer-paper": {
              width: drawerWidth,
              border: 0,
            },
          }}
        >
          {drawerContent}
        </Drawer>

        <Drawer
          variant="permanent"
          sx={{
            display: {
              xs: "none",
              md: "block",
            },

            "& .MuiDrawer-paper": {
              width: drawerWidth,
              boxSizing: "border-box",
              border: 0,
            },
          }}
          open
        >
          {drawerContent}
        </Drawer>
      </Box>

      <Box
        sx={{
          flexGrow: 1,
          width: {
            md: `calc(100% - ${drawerWidth}px)`,
          },
        }}
      >
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            bgcolor: "#FFFFFF",
            color: "text.primary",
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <Toolbar
            sx={{
              minHeight: "72px !important",
              px: {
                xs: 2,
                sm: 3,
              },
            }}
          >
            <IconButton
              onClick={() => setMobileOpen(true)}
              sx={{
                display: {
                  md: "none",
                },
                mr: 1,
              }}
            >
              <MenuRoundedIcon />
            </IconButton>

            <Box
              sx={{
                flexGrow: 1,
              }}
            >
              <Typography
                variant="body2"
                color="text.secondary"
              >
                Pune, Maharashtra
              </Typography>
            </Box>

            <Stack
              direction="row"
              spacing={1.5}
              sx={{ alignItems: "center" }}
            >
              <Tooltip title="Notifications">
                <IconButton>
                  <NotificationsNoneRoundedIcon />
                </IconButton>
              </Tooltip>

              <Avatar
                sx={{
                  width: 38,
                  height: 38,
                  bgcolor: "#FFE7DC",
                  color: "#F4511E",
                  fontWeight: 800,
                }}
              >
                {user?.first_name?.[0] ||
                  user?.username?.[0]?.toUpperCase()}
              </Avatar>

              <Box
                sx={{
                  display: {
                    xs: "none",
                    sm: "block",
                  },
                }}
              >
                <Typography
                  variant="body2"
                  fontWeight={750}
                >
                  {user?.full_name ||
                    user?.username}
                </Typography>

                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  {user?.role === "ADMINISTRATOR"
                    ? "Administrator"
                    : "Supervisor"}
                </Typography>
              </Box>
            </Stack>
          </Toolbar>
        </AppBar>

        <Box
          component="main"
          sx={{
            p: {
              xs: 2,
              sm: 3,
            },
            maxWidth: 1500,
            mx: "auto",
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}