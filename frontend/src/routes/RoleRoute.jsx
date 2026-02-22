import { Navigate, Outlet } from "react-router-dom";
import useAuth from "../hooks/useAuth";

function redirectByRole(role) {
  if (role === "seller") return "/seller/seller-home";
  if (role === "admin") return "/admin/sellers";
  return "/customer";
}

export default function RoleRoute({ allow = [] }) {
  const { isAuthenticated, role } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!allow.includes(role)) return <Navigate to={redirectByRole(role)} replace />;
  return <Outlet />;
}
