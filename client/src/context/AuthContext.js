import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Set up axios interceptor for authorization token
  useEffect(() => {
    const interceptor = axios.interceptors.request.use(
      (config) => {
        const storedToken = localStorage.getItem("token");
        if (storedToken) {
          config.headers["Authorization"] = `Bearer ${storedToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    return () => {
      axios.interceptors.request.eject(interceptor);
    };
  }, []);

  // Check if user is authenticated on initial load
  useEffect(() => {
    const initAuth = async () => {
      try {
        setLoading(true);

        // Get token from localStorage
        const storedToken = localStorage.getItem("token");
        if (!storedToken) {
          setLoading(false);
          return;
        }

        setToken(storedToken);

        // Get user from localStorage initially to prevent flicker
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          try {
            setUser(JSON.parse(storedUser));
          } catch (e) {
            console.error("Error parsing stored user:", e);
          }
        }

        // Verify token with server
        try {
          console.log(
            "Verifying token with server:",
            storedToken.substring(0, 20) + "..."
          );
          const response = await axios.get(
            "http://localhost:5001/api/auth/verify",
            {
              headers: { Authorization: `Bearer ${storedToken}` },
            }
          );

          if (response.data.user) {
            console.log(
              "Token verified successfully, user info:",
              response.data.user
            );
            setUser(response.data.user);
            localStorage.setItem("user", JSON.stringify(response.data.user));
          }
        } catch (serverError) {
          console.error("Token verification failed:", serverError);
          // If verification fails, log out
          if (serverError.response && serverError.response.status >= 401) {
            console.log("Invalid token, logging out");
            logout();
          }
        }
      } catch (e) {
        console.error("Auth initialization error:", e);
        setError("Authentication failed. Please log in again.");
        logout();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (userData, authToken) => {
    if (!authToken) {
      console.error("Login error: No auth token provided");
      setError("Authentication failed. No token received.");
      return;
    }

    console.log("Login with token:", authToken.substring(0, 20) + "...");
    setUser(userData);
    setToken(authToken);
    localStorage.setItem("token", authToken);
    localStorage.setItem("user", JSON.stringify(userData));

    // Update axios default headers
    axios.defaults.headers.common["Authorization"] = `Bearer ${authToken}`;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // Clear axios default headers
    delete axios.defaults.headers.common["Authorization"];
  };

  const updateUser = (updatedUserData) => {
    const updatedUser = { ...user, ...updatedUserData };
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        isAuthenticated: !!user,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
