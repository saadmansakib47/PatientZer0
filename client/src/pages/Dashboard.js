import React, { useState, useEffect } from "react";
import "./Dashboard.css";
import profilePic1 from "../assets/profile1.jpg";
import profilePic2 from "../assets/profile2.jpg";
import profilePic3 from "../assets/profile3.jpg";
import Chatbox from "../components/Chatbox";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Dashboard = ({ userRole }) => {
  const { isAuthenticated } = useAuth();

  const slides = [
    {
      id: 1,
      image: profilePic1,
      text: "Join over 850,000 members harnessing the power of their health insights through shared experience.",
    },
    {
      id: 2,
      image: profilePic2,
      text: `"If I can help somebody out as much as PLM has helped me, that adds to my purpose of wanting to do better." - JOSH, Living with MS`,
    },
    {
      id: 3,
      image: profilePic3,
      text: "Discover a supportive community where you can learn, share, and grow with others.",
    },
  ];

  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const slideInterval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(slideInterval);
  }, [slides.length]);

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Welcome to PatientZer0</h1>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto">
            Your comprehensive healthcare platform connecting patients and
            medical professionals
          </p>
        </div>

        <div className="flex flex-col md:flex-row justify-center gap-8 mb-16">
          <div className="bg-white shadow-md rounded-lg p-8 flex-1 max-w-md mx-auto">
            <h2 className="text-2xl font-bold mb-4 text-blue-600">
              For Patients
            </h2>
            <p className="mb-6 text-gray-700">
              Access your medical records, schedule appointments, and connect
              with verified healthcare professionals.
            </p>
            <div className="flex justify-center">
              <Link
                to="/signup"
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-md"
              >
                Join as Patient
              </Link>
            </div>
          </div>

          <div className="bg-white shadow-md rounded-lg p-8 flex-1 max-w-md mx-auto border-2 border-green-500">
            <div className="absolute -mt-12 ml-4 bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              Featured
            </div>
            <h2 className="text-2xl font-bold mb-4 text-green-600">
              For Doctors
            </h2>
            <p className="mb-6 text-gray-700">
              Create your professional profile, manage patients, issue
              prescriptions, and grow your practice with our platform.
            </p>
            <div className="flex flex-col gap-2 justify-center">
              <Link
                to="/doctor/register-test"
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-md text-center"
              >
                Quick Registration (Test)
              </Link>
              <Link
                to="/doctor/registration"
                className="border-2 border-green-500 text-green-600 hover:bg-green-50 font-bold py-3 px-6 rounded-md text-center"
              >
                Complete Registration
              </Link>
              <div className="text-center text-xs mt-2 text-red-500">
                ⚠️ Use quick registration for testing!
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6 text-center">
            Why Choose PatientZer0?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="font-bold text-lg mb-2">Secure & Private</h3>
              <p className="text-gray-700">
                Your medical data is encrypted and securely stored.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="font-bold text-lg mb-2">Expert Physicians</h3>
              <p className="text-gray-700">
                Connect with verified and qualified healthcare professionals.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="font-bold text-lg mb-2">Comprehensive Tools</h3>
              <p className="text-gray-700">
                Prescriptions, records, and communication all in one place.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="left-section">
        <h1>
          Find Your Community. <br /> Find Your Strength.
        </h1>
        <p>
          Join over 850,000 members harnessing the power of their health
          insights through shared experience.
        </p>
      </div>

      <div className="right-section">
        <div className="slideshow">
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className={`slide ${index === currentSlide ? "active" : ""}`}
              style={{ backgroundImage: `url(${slide.image})` }}
            >
              <div className="slide-content">
                <p>{slide.text}</p>
              </div>
            </div>
          ))}
        </div>
        <Chatbox />
      </div>

      <div className="actions-section">
        <h2>Getting started is easy!</h2>
        <div className="action-buttons">
          <span className="label">I want to...</span>
          <button className="highlighted-action">Meet others like me</button>
          <button className="action">Learn about my condition</button>
          <button className="action">Track my health</button>
          <button className="action">Share my story</button>
          <button className="action">Get involved</button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
