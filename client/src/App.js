// src/App.js
import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import MyHealth from "./pages/MyHealth";
import ScanReport from "./pages/ScanReport";
import Blog from "./pages/Blog";
import Community from "./pages/Community";
import Resources from "./pages/Resources";
import PatientProfile from "./components/PatientProfile";
import SignupForm from "./components/SignupForm";
import LoginForm from "./components/LoginForm";
import OAuthCallback from "./pages/OAuthCallback";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ChatBox from "./components/Chatbox";
import Notification from "./components/Notification";
import { getPatientIdFromToken } from "./utils/decodeToken";
import { jwtDecode } from "jwt-decode";
import Footer from "./components/Footer";
import "./theme.css";

// Separate component for the app content
const AppContent = () => {
  const [chatRequest, setChatRequest] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const { isAuthenticated, user, loading } = useAuth();

  useEffect(() => {
    const storedTheme = localStorage.getItem("darkMode") === "true";
    setDarkMode(storedTheme);
    document.body.className = storedTheme ? "dark-mode" : "light-mode";
  }, []);

  const handleChatRequest = (patientId) => {
    setChatRequest(`Patient ${patientId} wants to chat.`);
  };

  const acceptChat = () => {
    setChatRequest(null);
  };

  const toggleDarkMode = () => {
    const newTheme = !darkMode;
    setDarkMode(newTheme);
    localStorage.setItem("darkMode", newTheme);
    document.body.className = newTheme ? "dark-mode" : "light-mode";
  };

  // Show loading state while checking authentication
  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      {chatRequest && (
        <Notification message={chatRequest} onAccept={acceptChat} />
      )}
      <Routes>
        <Route path="/" element={<Dashboard userRole={user?.role} />} />
        <Route 
          path="/my-health" 
          element={
            isAuthenticated ? <MyHealth /> : <Navigate to="/login" replace />
          } 
        />
        <Route 
          path="/scan-report" 
          element={
            isAuthenticated ? <ScanReport /> : <Navigate to="/login" replace />
          } 
        />
        <Route path="/blog/*" element={<Blog />} />
        <Route path="/community" element={<Community />} />
        <Route path="/resources" element={<Resources />} />
        <Route 
          path="/signup" 
          element={
            isAuthenticated ? <Navigate to="/my-health" replace /> : <SignupForm />
          } 
        />
        <Route 
          path="/login" 
          element={
            isAuthenticated ? <Navigate to="/my-health" replace /> : <LoginForm />
          } 
        />
        <Route path="/oauth-callback" element={<OAuthCallback />} />
        <Route
          path="/profile"
          element={
            isAuthenticated ? <PatientProfile /> : <Navigate to="/login" replace />
          }
        />
        <Route
          path="/chat"
          element={
            isAuthenticated ? (
              <ChatBox userRole={user?.role} userId={user?.id} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
      <Footer />
    </>
  );
};

// Main App component
const App = () => {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
};

export default App;
