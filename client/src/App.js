// src/App.js
import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import MyHealth from "./pages/MyHealth";
import ScanReport from "./pages/ScanReport";
import Blog from "./pages/Blog";
import Community from "./pages/Community";
import Resources from "./pages/Resources";
import PatientProfile from "./components/PatientProfile";
import UnifiedRegistration from "./components/UnifiedRegistration";
import LoginForm from "./components/LoginForm";
import OAuthCallback from "./pages/OAuthCallback";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ChatBox from "./components/Chatbox";
import Footer from "./components/Footer";
import AdminRoute from "./components/AdminRoute";
import DoctorRoute from "./components/DoctorRoute";
import "./theme.css";

// Admin Components
import AdminLayout from "./components/admin/AdminLayout";
import DoctorVerifications from "./components/admin/DoctorVerifications";
import UserManagement from "./components/admin/UserManagement";

// Doctor Components
import DoctorLayout from "./components/doctor/DoctorLayout";
import DoctorDashboard from "./components/doctor/DoctorDashboard";
import DoctorProfile from "./components/doctor/DoctorProfile";
import DoctorWaiting from "./components/doctor/DoctorWaiting";
import DoctorPatients from "./components/doctor/DoctorPatients";
import DoctorSchedule from "./components/doctor/DoctorSchedule";
import DoctorPrescriptions from "./components/doctor/DoctorPrescriptions";

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <div className="flex flex-col min-h-screen">
          <Toaster position="top-right" />
          <Navbar />
          <div className="flex-grow">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Dashboard />} />
              <Route path="/blog/*" element={<Blog />} />
              <Route path="/community" element={<Community />} />
              <Route path="/resources" element={<Resources />} />
              <Route path="/login" element={<LoginForm />} />
              <Route path="/signup" element={<UnifiedRegistration />} />
              <Route path="/oauth-callback" element={<OAuthCallback />} />

              {/* Protected Patient Routes */}
              <Route
                path="/my-health"
                element={
                  <ProtectedRoute>
                    <MyHealth />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/scan-report"
                element={
                  <ProtectedRoute>
                    <ScanReport />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <PatientProfile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/chat"
                element={
                  <ProtectedRoute>
                    <ChatBox />
                  </ProtectedRoute>
                }
              />

              {/* Admin Routes */}
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <AdminLayout>
                      <Outlet />
                    </AdminLayout>
                  </AdminRoute>
                }
              >
                <Route
                  path="doctor-verifications"
                  element={<DoctorVerifications />}
                />
                <Route path="users" element={<UserManagement />} />
                <Route
                  index
                  element={
                    <Navigate to="/admin/doctor-verifications" replace />
                  }
                />
              </Route>

              {/* Doctor Routes */}
              <Route path="/doctor/waiting" element={<DoctorWaiting />} />
              <Route
                path="/doctor"
                element={
                  <DoctorRoute>
                    <DoctorLayout />
                  </DoctorRoute>
                }
              >
                <Route path="dashboard" element={<DoctorDashboard />} />
                <Route path="profile" element={<DoctorProfile />} />
                <Route path="patients" element={<DoctorPatients />} />
                <Route path="schedule" element={<DoctorSchedule />} />
                <Route path="prescriptions" element={<DoctorPrescriptions />} />
                <Route
                  index
                  element={<Navigate to="/doctor/dashboard" replace />}
                />
              </Route>

              {/* Fallback Route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
};

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default App;
