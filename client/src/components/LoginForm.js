// src/components/LoginForm.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance"; // Import the axios instance
import { useAuth } from "../context/AuthContext";
import GoogleLoginButton from "./GoogleLoginButton";
import "./form.css";
import { toast } from "react-hot-toast";

const LoginForm = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await axiosInstance.post("/auth/login", formData);
      console.log("Login response:", res.data);

      // Ensure we're capturing all necessary user data
      const userData = {
        token: res.data.token,
        user: {
          id: res.data.user.id,
          name: res.data.user.name,
          email: res.data.user.email,
          role: res.data.user.role,
          // Include any other needed user data
          profilePhoto: res.data.user.profilePhoto,
          additionalInfo: res.data.user.additionalInfo,
        },
      };

      console.log("User data being stored:", userData);

      // Call login function from AuthContext
      login(userData.user, userData.token);

      // Store email in localStorage for future reference
      localStorage.setItem("userEmail", userData.user.email);

      // Store token in localStorage
      localStorage.setItem("token", userData.token);
      localStorage.setItem("user", JSON.stringify(userData.user));

      // Show success message
      toast.success(`Welcome back, ${userData.user.name}!`);

      // Navigate based on user role
      if (userData.user.role === "admin") {
        navigate("/admin/doctor-verifications");
      } else if (userData.user.role === "doctor") {
        navigate("/doctor/dashboard");
      } else {
        navigate("/my-health");
      }
    } catch (error) {
      console.error(
        "Login error:",
        error.response ? error.response.data : error
      );

      // Check for specific doctor verification pending status
      if (error.response?.status === 403 && error.response?.data?.redirect) {
        toast.error(error.response.data.error);
        // Redirect to doctor waiting page if specified
        navigate(error.response.data.redirect);
        return;
      }

      setError(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Login failed. Please try again."
      );
    }
  };

  return (
    <div className="form-container">
      <h1 className="form-title">Login</h1>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          name="email"
          placeholder="Email"
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          onChange={handleChange}
          required
        />
        <button type="submit" className="btn">
          Login
        </button>
      </form>

      <div className="divider">
        <span>OR</span>
      </div>

      <GoogleLoginButton />

      <p className="mt-4 text-center">
        Don't have an account?{" "}
        <a href="/signup" className="text-blue-500 hover:underline">
          Sign up
        </a>
      </p>
    </div>
  );
};

export default LoginForm;
