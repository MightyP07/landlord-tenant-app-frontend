// src/pages/ProtectedRoute.jsx
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { toast } from "react-toastify";

export default function ProtectedRoute({ allowedRole }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <p>Loading...</p>; // prevents flicker while auth state is loading
  }

  // Not logged in
  if (!user) {
    toast.info("Please log in to access this page.");
    return <Navigate to="/login" replace />;
  }

  // Logged in but role not allowed
  if (allowedRole && user.role !== allowedRole) {
    toast.warn("You are not authorized to view this page.");
    return <Navigate to="/profile" replace />;
  }

  // Authorized
  return <Outlet />;
}
