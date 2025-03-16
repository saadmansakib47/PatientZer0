import React, { useEffect, useState } from "react";
import "./MyHealth.css";

const MyHealth = () => {
  const [savedReports, setSavedReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSavedReports = async () => {
      try {
        const token = localStorage.getItem("token"); // Assuming token is stored here
        if (!token) {
          setError("Please log in to view saved reports.");
          setLoading(false);
          return;
        }

        const response = await fetch("https://apollo-api-wmzs.onrender.com/api/get-saved-reports", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Failed to fetch reports");

        setSavedReports(data.reports);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSavedReports();
  }, []);

  const healthMetrics = [
    { title: "Heart Rate", value: "72 bpm", icon: "❤️" },
    { title: "Blood Pressure", value: "120/80 mmHg", icon: "🩸" },
    { title: "Blood Sugar", value: "90 mg/dL", icon: "🍬" },
    { title: "Oxygen Level", value: "98%", icon: "💧" },
    { title: "Cholesterol", value: "180 mg/dL", icon: "🍲" },
  ];

  return (
    <div className="my-health">
      <h1 className="my-health-title">My Health Dashboard</h1>
      <p className="my-health-subtitle">Track and manage your vital health metrics.</p>

      {/* Health Metrics Section */}
      <div className="health-metrics">
        {healthMetrics.map((metric, index) => (
          <div className="metric-card" key={index}>
            <div className="metric-icon">{metric.icon}</div>
            <div className="metric-details">
              <h3 className="metric-title">{metric.title}</h3>
              <p className="metric-value">{metric.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* 🔹 Saved Reports Section */}
      <div className="saved-reports">
        <h2>Saved Reports</h2>
        {loading ? (
          <p>Loading reports...</p>
        ) : error ? (
          <p className="error-message">{error}</p>
        ) : savedReports.length === 0 ? (
          <p>No saved reports found.</p>
        ) : (
          <ul>
            {savedReports.map((report, index) => (
              <li key={index} className="report-item">
                <h3>{report.reportName}</h3>
                <p><strong>Urgent Concern:</strong> {report.urgentConcern}</p>
                <button className="view-more-btn">View More</button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default MyHealth;
