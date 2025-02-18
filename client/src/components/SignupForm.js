// src/components/SignupForm.js
import React, { useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import { useAuth } from "../context/AuthContext";
import "./form.css";

const countries = [
    "United States", "Canada", "United Kingdom", "Australia", "India",
    "Germany", "France", "Japan", "China", "Brazil", "South Africa"
];

const certificationsList = ["FCPS", "MRCP", "MD", "USMLE", "PLAB"];

const SignupForm = () => {
    const { login } = useAuth();
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        role: "patient",
        age: "",
        gender: "male",
        country: "",
        state: "",
        hospitalName: "",
        certificationId: "",
        qualification: "",
        certifications: [], // New state for certifications
    });

    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState(null); // State to hold error message

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleCheckboxChange = (e) => {
        const { value, checked } = e.target;
        setFormData((prevData) => {
            const certifications = checked
                ? [...prevData.certifications, value]
                : prevData.certifications.filter((cert) => cert !== value);
            return { ...prevData, certifications };
        });
    };

    const toggleShowPassword = () => {
        setShowPassword(!showPassword);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null); // Clear previous error

        try {
            const res = await axiosInstance.post("/auth/signup", formData);
            console.log(res.data);
            localStorage.setItem("token", res.data.token);
            login({ name: formData.name, role: formData.role });
        } catch (error) {
            if (error.response && error.response.status === 400) {
                setError(error.response.data.error); // Display error from backend
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
                <label htmlFor="role">Select Role:</label>
                <select name="role" value={formData.role} onChange={handleChange}>
                    <option value="patient">Patient</option>
                    <option value="doctor">Doctor</option>
                </select>

                {formData.role === "patient" ? (
                    <>
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
                    </>
                ) : (
                    <>
                        <input
                            type="text"
                            name="hospitalName"
                            placeholder="Hospital Name"
                            onChange={handleChange}
                            required
                        />
                        <input
                            type="text"
                            name="certificationId"
                            placeholder="Certification ID (must be unique)"
                            onChange={handleChange}
                            required
                        />
                        <input
                            type="text"
                            name="qualification"
                            placeholder="Qualification"
                            onChange={handleChange}
                            required
                        />

                        <label>Certifications:</label>
                        <div className="checkbox-group">
                            {certificationsList.map((cert, index) => (
                                <div key={index} className="checkbox-item">
                                    <input
                                        type="checkbox"
                                        name="certifications"
                                        value={cert}
                                        onChange={handleCheckboxChange}
                                    />
                                    <label>{cert}</label>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {/* Display error message if account already exists */}
                {error && <p className="error-message">{error}</p>}

                <button type="submit" className="btn">
                    Sign Up
                </button>
            </form>
        </div>
    );
};

export default SignupForm;
