// MyHealth.js
import React from "react";
import "./MyHealth.css";

const MyHealth = () => {
  const healthMetrics = [
    { title: "Heart Rate", value: "72 bpm", icon: "❤️" },
    { title: "Blood Pressure", value: "120/80 mmHg", icon: "🩸" },
    { title: "Blood Sugar", value: "90 mg/dL", icon: "🍬" },
    { title: "Oxygen Level", value: "98%", icon: "💧" },
    { title: "Cholesterol", value: "180 mg/dL", icon: "🍲" },
  ];

  const healthTips = [
    "Drink at least 8 glasses of water daily.",
    "Maintain a balanced diet rich in fruits and vegetables.",
    "Exercise for 30 minutes daily to improve heart health.",
    "Monitor your blood sugar regularly if you have diabetes.",
  ];

  const recentActivities = [
    { date: "2024-11-05", activity: "Routine blood test" },
    { date: "2024-11-01", activity: "Monthly check-up" },
    { date: "2024-10-28", activity: "Dental cleaning" },
  ];

  const healthGoals = [
    { goal: "Daily Steps", progress: 7000, target: 10000 },
    { goal: "Calories Burned", progress: 1500, target: 2000 },
    { goal: "Sleep Hours", progress: 6, target: 8 },
  ];

  return (
    <div className="my-health">
      <h1 className="my-health-title">My Health Dashboard</h1>
      <p className="my-health-subtitle">
        Track and manage your vital health metrics.
      </p>

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

      {/* Health Tips Section */}
      <div className="health-tips">
        <h2>Health Tips</h2>
        <ul>
          {healthTips.map((tip, index) => (
            <li key={index}>{tip}</li>
          ))}
        </ul>
      </div>

      {/* Recent Activities Section */}
      <div className="recent-activities">
        <h2>Recent Activities</h2>
        <ul>
          {recentActivities.map((activity, index) => (
            <li key={index}>
              <span>{activity.date}</span> - {activity.activity}
            </li>
          ))}
        </ul>
      </div>

      {/* Health Goals Section */}
      <div className="health-goals">
        <h2>Health Goals</h2>
        {healthGoals.map((goal, index) => (
          <div className="goal-progress" key={index}>
            <h4>{goal.goal}</h4>
            <div className="progress-bar">
              <div
                className="progress"
                style={{
                  width: `${(goal.progress / goal.target) * 100}%`,
                }}
              ></div>
            </div>
            <p>
              {goal.progress} / {goal.target}
            </p>
          </div>
        ))}
      </div>

      {/* Appointments Section */}
      <div className="appointments">
        <h2>Upcoming Appointments</h2>
        <ul>
          <li>Dr. Smith - Cardiologist - Nov 10, 2024 - 10:00 AM</li>
          <li>Dr. Lee - Dentist - Dec 1, 2024 - 2:00 PM</li>
        </ul>
      </div>

      {/* Add New Metric Button */}
      <button className="add-metric-btn">Add New Metric</button>
    </div>
  );
};

export default MyHealth;
