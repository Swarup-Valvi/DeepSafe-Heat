import { Navigate, Outlet } from "react-router";

import { useAuth } from "../context/AuthContext";

export default function RoleRoute({ allowedRoles }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    const fallback =
      user.role === "ADMINISTRATOR"
        ? "/admin/dashboard"
        : "/supervisor/dashboard";

    return <Navigate to={fallback} replace />;
  }

  return <Outlet />;
}