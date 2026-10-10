import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import Forecast from "./pages/Forecast";
import AppLayout from "./components/AppLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleRoute from "./components/RoleRoute";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import SupervisorDashboard from "./pages/SupervisorDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import NotFoundPage from "./pages/NotFoundPage";
import PlanActivityPage from "./pages/PlanActivityPage";
import AssessmentResultsPage from "./pages/AssessmentResultsPage";
import SaferTimeComparisonPage from "./pages/SaferTimeComparisonPage";
import ActivityHistoryPage from "./pages/ActivityHistoryPage";
import ActivityDetailsPage from "./pages/ActivityDetailsPage";
import WeatherForecastPage from "./pages/WeatherForecastPage";
import AlertsPage from "./pages/AlertsPage";
import ReportsPage from "./pages/ReportsPage";
import ProfilePage from "./pages/ProfilePage";
import ManageUsersPage from "./pages/ManageUsersPage";
import WeatherDataPage from "./pages/WeatherDataPage";
import ActivityTypesPage from "./pages/ActivityTypesPage";
import RiskRulesPage from "./pages/RiskRulesPage";
import { useAuth } from "./context/AuthContext";

function HomeRedirect() {
  const {
    user,
    isAuthenticated,
    loading,
  } = useAuth();

  if (loading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const destination =
    user?.role === "ADMINISTRATOR"
      ? "/admin/dashboard"
      : "/supervisor/dashboard";

  return <Navigate to={destination} replace />;
}

function PlaceholderPage({ title }) {
  return <h1>{title}</h1>;
}

export default function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={<HomeRedirect />}
      />

      <Route
        path="/login"
        element={<LoginPage />}
      />

      <Route
        path="/register"
        element={<RegisterPage />}
      />

<Route element={<ProtectedRoute />}>
  <Route element={<AppLayout />}>
    <Route
      element={
        <RoleRoute
          allowedRoles={["SUPERVISOR"]}
        />
      }
    >
      <Route
        path="/supervisor/dashboard"
        element={<SupervisorDashboard />}
      />

      <Route
        path="/supervisor/forecast"
        element={<Forecast />}
      />

      <Route
        path="/supervisor/plan-activity"
        element={<PlanActivityPage />}
      />

      <Route
        path="/supervisor/assessment-results"
        element={<AssessmentResultsPage />}
      />

      <Route
        path="/supervisor/safer-time"
        element={<SaferTimeComparisonPage />}
      />

      <Route
        path="/supervisor/history"
        element={<ActivityHistoryPage />}
      />

      <Route
        path="/supervisor/history/:activityId"
        element={<ActivityDetailsPage />}
      />

      <Route
        path="/supervisor/weather"
        element={<WeatherForecastPage />}
      />

      <Route
        path="/supervisor/alerts"
        element={<AlertsPage />}
      />

      <Route
        path="/supervisor/reports"
        element={<ReportsPage />}
      />

      <Route
        path="/supervisor/profile"
        element={<ProfilePage />}
      />
    </Route>

    <Route
      element={
        <RoleRoute
          allowedRoles={["ADMINISTRATOR"]}
        />
      }
    >
      <Route
        path="/admin/dashboard"
        element={<AdminDashboard />}
      />

      <Route
        path="/admin/users"
        element={<ManageUsersPage />}
      />

      <Route
        path="/admin/weather-data"
        element={<WeatherDataPage />}
      />

      <Route
        path="/admin/activity-types"
        element={<ActivityTypesPage />}
      />

      <Route
        path="/admin/risk-rules"
        element={<RiskRulesPage />}
      />
    </Route>
  </Route>
</Route>
      <Route
        path="*"
        element={<NotFoundPage />}
      />
    </Routes>
  );
}