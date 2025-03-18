import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { toast, Toaster } from "react-hot-toast";

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
  "Bangladesh",
];

const UnifiedRegistration = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(1); // 1: Basic info, 2: Doctor details (if applicable)
  const [role, setRole] = useState("patient");

  // Basic user data
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    age: "",
    gender: "male",
    country: "Bangladesh",
    state: "Dhaka",
  });

  // Doctor-specific data
  const [doctorData, setDoctorData] = useState({
    bmdcNumber: "",
    specialization: "General Physician",
    hospitalName: "",
    chamberAddress: "",
    consultationFee: "500",
    bio: "",
  });

  // File uploads
  const [files, setFiles] = useState({
    bmdcCertificate: null,
    degreeCertificate: null,
    chamberPhoto: null,
  });

  const handleUserDataChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRoleChange = (e) => {
    setRole(e.target.value);
  };

  const handleDoctorDataChange = (e) => {
    const { name, value } = e.target;
    setDoctorData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const { name, files: selectedFiles } = e.target;
    setFiles((prev) => ({
      ...prev,
      [name]: selectedFiles[0],
    }));
  };

  const validateFirstStep = () => {
    if (!userData.name || !userData.email || !userData.password) {
      setError("Please fill in all required fields");
      return false;
    }

    if (userData.password !== userData.confirmPassword) {
      setError("Passwords don't match");
      return false;
    }

    if (userData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }

    return true;
  };

  const handleNextStep = (e) => {
    e.preventDefault();

    if (!validateFirstStep()) {
      return;
    }

    setError("");

    // If user is a patient, submit registration now
    if (role === "patient") {
      handleSubmit();
    } else {
      // If user is a doctor, proceed to doctor details
      setStep(2);
    }
  };

  const handlePreviousStep = () => {
    setStep(1);
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Create combined data
      const registrationData = {
        ...userData,
        role: role,
      };

      // Register the user account
      const userResponse = await axios.post(
        "http://localhost:5001/api/auth/signup",
        registrationData
      );

      // If user is a doctor, register doctor details
      if (role === "doctor" && userResponse.data.token) {
        const formData = new FormData();

        // Add doctor-specific fields
        Object.keys(doctorData).forEach((key) => {
          formData.append(key, doctorData[key]);
        });

        // Add files
        if (files.bmdcCertificate) {
          formData.append("bmdcCertificate", files.bmdcCertificate);
        }

        if (files.degreeCertificate) {
          formData.append("degreeCertificate", files.degreeCertificate);
        }

        if (files.chamberPhoto) {
          formData.append("chamberPhoto", files.chamberPhoto);
        }

        // Submit doctor details with token from user registration
        await axios.post(
          "http://localhost:5001/api/doctor/register",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${userResponse.data.token}`,
            },
          }
        );

        toast.success(
          "Your doctor profile has been submitted for verification!"
        );
      } else {
        toast.success("Registration successful!");
      }

      // Store authentication data
      localStorage.setItem("token", userResponse.data.token);
      localStorage.setItem("user", JSON.stringify(userResponse.data.user));
      localStorage.setItem("userEmail", userData.email);

      // Update auth context
      login(userResponse.data.user, userResponse.data.token);

      // Redirect based on role
      if (role === "doctor") {
        setTimeout(() => {
          navigate("/doctor/waiting");
        }, 2000);
      } else {
        setTimeout(() => {
          navigate("/my-health");
        }, 2000);
      }
    } catch (error) {
      console.error("Registration error:", error);
      const errorMsg =
        error.response?.data?.error || "Registration failed. Please try again.";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md mt-10 mb-10">
      <Toaster position="top-right" />
      <h1 className="text-2xl font-bold mb-6 text-center">
        Create Your Account
      </h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Step indicators */}
      {role === "doctor" && (
        <div className="flex justify-center mb-6">
          <div className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step === 1 ? "bg-blue-500 text-white" : "bg-gray-300"
              }`}
            >
              1
            </div>
            <div className="h-1 w-12 bg-gray-300 mx-2"></div>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step === 2 ? "bg-blue-500 text-white" : "bg-gray-300"
              }`}
            >
              2
            </div>
          </div>
        </div>
      )}

      {step === 1 && (
        <form onSubmit={handleNextStep}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={userData.name}
              onChange={handleUserDataChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="John Doe"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={userData.email}
              onChange={handleUserDataChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="example@email.com"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              name="password"
              value={userData.password}
              onChange={handleUserDataChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Create a password"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Password must be at least 6 characters
            </p>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Confirm Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={userData.confirmPassword}
              onChange={handleUserDataChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Confirm your password"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              I want to join as:
            </label>
            <div className="flex space-x-4">
              <div className="flex items-center">
                <input
                  type="radio"
                  id="patient-role"
                  name="role"
                  value="patient"
                  checked={role === "patient"}
                  onChange={handleRoleChange}
                  className="mr-2"
                />
                <label htmlFor="patient-role">Patient</label>
              </div>
              <div className="flex items-center">
                <input
                  type="radio"
                  id="doctor-role"
                  name="role"
                  value="doctor"
                  checked={role === "doctor"}
                  onChange={handleRoleChange}
                  className="mr-2"
                />
                <label htmlFor="doctor-role">Doctor</label>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Age
              </label>
              <input
                type="number"
                name="age"
                value={userData.age}
                onChange={handleUserDataChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Your age"
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Gender
              </label>
              <select
                name="gender"
                value={userData.gender}
                onChange={handleUserDataChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Country
              </label>
              <select
                name="country"
                value={userData.country}
                onChange={handleUserDataChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                {countries.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                State/City
              </label>
              <input
                type="text"
                name="state"
                value={userData.state}
                onChange={handleUserDataChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Your state or city"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className={`bg-blue-500 hover:bg-blue-600 text-white py-2 px-6 rounded ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={loading}
            >
              {loading
                ? "Processing..."
                : role === "doctor"
                ? "Next Step"
                : "Register"}
            </button>
          </div>

          <p className="mt-4 text-center">
            Already have an account?{" "}
            <a href="/login" className="text-blue-500 hover:underline">
              Login
            </a>
          </p>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                BMDC Registration Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="bmdcNumber"
                value={doctorData.bmdcNumber}
                onChange={handleDoctorDataChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Your BMDC registration number"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Specialization
              </label>
              <select
                name="specialization"
                value={doctorData.specialization}
                onChange={handleDoctorDataChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="General Physician">General Physician</option>
                <option value="Cardiologist">Cardiologist</option>
                <option value="Dermatologist">Dermatologist</option>
                <option value="Neurologist">Neurologist</option>
                <option value="Pediatrician">Pediatrician</option>
                <option value="Orthopedist">Orthopedist</option>
                <option value="ENT Specialist">ENT Specialist</option>
                <option value="Gynecologist">Gynecologist</option>
                <option value="Psychiatrist">Psychiatrist</option>
                <option value="Dentist">Dentist</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Hospital/Clinic Name
              </label>
              <input
                type="text"
                name="hospitalName"
                value={doctorData.hospitalName}
                onChange={handleDoctorDataChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Your hospital or clinic name"
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Consultation Fee (BDT)
              </label>
              <input
                type="number"
                name="consultationFee"
                value={doctorData.consultationFee}
                onChange={handleDoctorDataChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="e.g. 500"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Chamber Address
            </label>
            <textarea
              name="chamberAddress"
              value={doctorData.chamberAddress}
              onChange={handleDoctorDataChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Your practice address"
              rows="2"
            ></textarea>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Professional Bio
            </label>
            <textarea
              name="bio"
              value={doctorData.bio}
              onChange={handleDoctorDataChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Brief professional biography"
              rows="3"
            ></textarea>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                BMDC Certificate <span className="text-red-500">*</span>
              </label>
              <input
                type="file"
                name="bmdcCertificate"
                onChange={handleFileChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Upload your BMDC registration certificate (PDF or image)
              </p>
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Degree Certificate
              </label>
              <input
                type="file"
                name="degreeCertificate"
                onChange={handleFileChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
              <p className="text-xs text-gray-500 mt-1">
                Upload your highest medical degree certificate
              </p>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Chamber Photo (Optional)
            </label>
            <input
              type="file"
              name="chamberPhoto"
              onChange={handleFileChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
            <p className="text-xs text-gray-500 mt-1">
              Upload a photo of your clinic/chamber
            </p>
          </div>

          <div className="flex justify-between">
            <button
              type="button"
              onClick={handlePreviousStep}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-6 rounded"
            >
              Back
            </button>

            <button
              type="submit"
              className={`bg-green-500 hover:bg-green-600 text-white py-2 px-6 rounded ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={loading}
            >
              {loading ? "Registering..." : "Complete Registration"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default UnifiedRegistration;
