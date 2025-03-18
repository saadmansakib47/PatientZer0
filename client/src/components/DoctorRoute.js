import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const DoctorRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Check if user is logged in and has doctor role
  if (!user || user.role !== "doctor") {
    return <Navigate to="/login" replace />;
  }

  // Check if doctor is approved
  if (
    user.additionalInfo &&
    user.additionalInfo.verificationStatus !== "approved"
  ) {
    return <Navigate to="/doctor/waiting" replace />;
  }

  return children;
};

export default DoctorRoute;
