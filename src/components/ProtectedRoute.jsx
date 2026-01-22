import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  // Get user data from localStorage
  const userData = JSON.parse(localStorage.getItem("user"));
  
  // Check if user is authenticated
  const isAuthenticated = userData && userData.isAuthenticated;
  
  // If no user is logged in, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // If specific roles are required and user doesn't have one, redirect to appropriate page
  if (allowedRoles.length > 0 && !allowedRoles.includes(userData.role)) {
    // Redirect based on user role
    switch(userData.role) {
      case "admin":
        return <Navigate to="/admin" replace />;
      case "seller":
        return <Navigate to="/seller/dashboard" replace />;
      case "customer":
        return <Navigate to="/customer/home" replace />;
      default:
        return <Navigate to="/" replace />;
    }
  }
  
  return children;
}