import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RoleRoute({ allowedRole, children }) {
	const { user, isAuthenticated } = useAuth();

	if (!isAuthenticated || !user?.token) {
		return <Navigate to="/login" replace />;
	}

	if (user.role !== allowedRole) {
		return <Navigate to="/" replace />;
	}

	return children;
}
