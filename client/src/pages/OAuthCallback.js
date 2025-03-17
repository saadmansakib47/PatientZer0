import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const OAuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        // Get token from URL query parameters
        const params = new URLSearchParams(location.search);
        const token = params.get("token");

        if (!token) {
          console.error("No token found in URL");
          navigate("/login");
          return;
        }

        // Store token and redirect
        localStorage.setItem("token", token);

        // Decode token to get user info
        const base64Url = token.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split("")
            .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
            .join("")
        );

        const { _id, name, email, role } = JSON.parse(jsonPayload);

        // Update auth context
        login({ id: _id, name, email, role, token });

        // Always redirect to MyHealth page
        navigate("/my-health");
      } catch (error) {
        console.error("Error processing OAuth callback:", error);
        navigate("/login");
      }
    };

    handleOAuthCallback();
  }, [location, navigate, login]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-center text-gray-800 mb-4">
          Processing your login...
        </h2>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    </div>
  );
};

export default OAuthCallback;
