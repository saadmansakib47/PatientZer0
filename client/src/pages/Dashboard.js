import React, { useState, useEffect } from "react";
import "./Dashboard.css";
import profilePic1 from "../assets/profile1.jpg";
import profilePic2 from "../assets/profile2.jpg";
import profilePic3 from "../assets/profile3.jpg";
import Chatbox from "../components/Chatbox";

const Dashboard = () => {
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
