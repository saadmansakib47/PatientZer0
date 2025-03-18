import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const AdminRoute = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  console.log("AdminRoute - Auth Status:", {
    isAuthenticated,
    userRole: user?.role,
    hasToken: !!localStorage.getItem("token"),
  });

  if (!isAuthenticated || !user) {
    console.log("AdminRoute - User not authenticated, redirecting to /login");
    return <Navigate to="/login" replace />;
  }

  if (user.role !== "admin") {
    console.log("AdminRoute - User not admin, redirecting to /");
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AdminRoute;
