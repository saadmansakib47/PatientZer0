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
import Footer from "./components/Footer"; // Import Footer component
import "./theme.css";

const App = () => {
  const [chatRequest, setChatRequest] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const { isAuthenticated, userRole, patientId } = useAuth() || {};

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedPatientId = getPatientIdFromToken(token);
        const decodedUserRole = jwtDecode(token).role;
        if (decodedPatientId) {
          console.log("User is authenticated:", true);
        } else {
          console.log("User is authenticated:", false);
        }
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    } else {
      console.log("No token found, user is not authenticated");
    }
  }, []);

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

  return (
    <AuthProvider>
      <Router>
        <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
        {chatRequest && userRole !== "doctor" && (
          <Notification message={chatRequest} onAccept={acceptChat} />
        )}
        <Routes>
          <Route path="/" element={<Dashboard userRole={userRole} />} />
          <Route path="/my-health" element={<MyHealth />} />
          <Route path="/scan-report" element={<ScanReport />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/community" element={<Community />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/signup" element={<SignupForm />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/oauth-callback" element={<OAuthCallback />} />
          <Route
            path="/profile"
            element={
              isAuthenticated ? <PatientProfile /> : <Navigate to="/login" />
            }
          />
          <Route
            path="/chat"
            element={
              isAuthenticated ? (
                <ChatBox userRole={userRole} userId={patientId} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
        </Routes>
        <Footer /> {/* Add Footer component here */}
      </Router>
    </AuthProvider>
  );
};

export default App;
