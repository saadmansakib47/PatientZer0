// src/components/SignupForm.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import { useAuth } from "../context/AuthContext";
import GoogleLoginButton from "./GoogleLoginButton";
import "./form.css";

const countries = [
  "United States",
  "Canada",
  "United Kingdom",
  "Australia",
  "India",
  "Germany",
  "France",
  "Japan",
  "China",
  "Brazil",
  "South Africa",
];

const SignupForm = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    age: "",
    gender: "male",
    country: "",
    state: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const res = await axiosInstance.post("/auth/signup", formData);
      console.log(res.data);

      // If we have a token in the response
      if (res.data.token) {
        const userData = {
          id: res.data.user?.id,
          name: formData.name,
          email: formData.email,
          role: "patient", // Default role is always patient
          token: res.data.token,
        };

        login(userData);
        navigate("/my-health"); // Always redirect to MyHealth page
      } else {
        navigate("/login");
      }
    } catch (error) {
      if (error.response && error.response.status === 400) {
        setError(error.response.data.error);
      } else {
        setError("An error occurred. Please try again.");
      }
      console.error(error.response ? error.response.data : error.message);
    }
  };

  return (
    <div className="form-container">
      <h1 className="form-title">PatientZer0</h1>
      <p className="form-subtitle">Your health ally from experience</p>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Name"
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          onChange={handleChange}
          required
        />
        <div className="password-field">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Password"
            onChange={handleChange}
            required
          />
          <button
            type="button"
            onClick={toggleShowPassword}
            className="show-password-toggle"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
        <input
          type="number"
          name="age"
          placeholder="Age"
          onChange={handleChange}
        />
        <label htmlFor="gender">Gender:</label>
        <select
          name="gender"
          value={formData.gender}
          onChange={handleChange}
        >
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>
        <label htmlFor="country">Country:</label>
        <select
          name="country"
          value={formData.country}
          onChange={handleChange}
          required
        >
          <option value="">Select your country</option>
          {countries.map((country, index) => (
            <option key={index} value={country}>
              {country}
            </option>
          ))}
        </select>
        <input
          type="text"
          name="state"
          placeholder="State"
          onChange={handleChange}
        />

        {/* Display error message if account already exists */}
        {error && <p className="error-message">{error}</p>}

        <button type="submit" className="btn">
          Sign Up
        </button>
      </form>

      <div className="divider">
        <span>OR</span>
      </div>

      <GoogleLoginButton />

      <p className="mt-4 text-center">
        Already have an account?{" "}
        <a href="/login" className="text-blue-500 hover:underline">
          Login
        </a>
      </p>
    </div>
  );
};

export default SignupForm;
