// src/components/LoginForm.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance"; // Import the axios instance
import { useAuth } from "../context/AuthContext";
import GoogleLoginButton from "./GoogleLoginButton";
import "./form.css";

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
      console.log("Logged in user:", res.data.user);

      // Store token and update auth context
      const userData = {
        id: res.data.user.id,
        name: res.data.user.name,
        email: res.data.user.email,
        role: res.data.user.role,
        token: res.data.token,
      };

      login(userData);

      // Redirect based on role
      if (res.data.user.role === "doctor") {
        navigate("/doctor-dashboard");
      } else {
        navigate("/patient-dashboard");
      }
    } catch (error) {
      console.error(error.response ? error.response.data : error.message);
      setError(
        error.response?.data?.error || "Login failed. Please try again."
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
