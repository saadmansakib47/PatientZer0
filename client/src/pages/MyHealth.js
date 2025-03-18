// MyHealth.js
import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { savedReportService } from '../services/savedReportService';
import "./MyHealth.css";

const MyHealth = () => {
  const { isAuthenticated, loading: authLoading, user } = useAuth();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [savedReports, setSavedReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [checkedConcerns, setCheckedConcerns] = useState({});

  useEffect(() => {
    // Check if we have a token in localStorage
    const token = localStorage.getItem("token");
    if (!token) {
      navigate('/login');
      return;
    }

    // If we're not loading and not authenticated, redirect to login
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [authLoading, isAuthenticated, navigate]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchSavedReports();
    }
  }, [isAuthenticated]);

  const fetchSavedReports = async () => {
    try {
      const reports = await savedReportService.getAllSavedReports();
      setSavedReports(reports);
      
      // Initialize checked state for all concerns
      const initialCheckedState = {};
      reports.forEach(report => {
        if (report.analysis?.urgentConcerns) {
          report.analysis.urgentConcerns.forEach((concern, index) => {
            const concernId = `${report._id}-${index}`;
            initialCheckedState[concernId] = false;
          });
        }
      });
      setCheckedConcerns(initialCheckedState);
    } catch (err) {
      setError('Failed to fetch reports');
    } finally {
      setLoading(false);
    }
  };

  const handleReportClick = async (report) => {
    try {
      setSelectedReport(report);
    } catch (err) {
      setError('Failed to fetch report details');
    }
  };

  const handleDeleteReport = async (reportId) => {
    if (window.confirm('Are you sure you want to delete this report?')) {
      try {
        await savedReportService.deleteSavedReport(reportId);
        setSavedReports(savedReports.filter(report => report._id !== reportId));
        if (selectedReport?._id === reportId) {
          setSelectedReport(null);
        }
      } catch (err) {
        setError('Failed to delete report');
      }
    }
  };

  const handleCheckConcern = (reportId, concernIndex) => {
    const concernId = `${reportId}-${concernIndex}`;
    setCheckedConcerns(prev => ({
      ...prev,
      [concernId]: !prev[concernId]
    }));
  };

  const handleDeleteConcern = (reportId, concernIndex) => {
    if (window.confirm('Are you sure you want to delete this concern?')) {
      setSavedReports(prevReports => {
        return prevReports.map(report => {
          if (report._id === reportId) {
            const newUrgentConcerns = [...report.analysis.urgentConcerns];
            newUrgentConcerns.splice(concernIndex, 1);
            return {
              ...report,
              analysis: {
                ...report.analysis,
                urgentConcerns: newUrgentConcerns
              }
            };
          }
          return report;
        });
      });

      // Remove the checked state for this concern
      const concernId = `${reportId}-${concernIndex}`;
      setCheckedConcerns(prev => {
        const newState = { ...prev };
        delete newState[concernId];
        return newState;
      });
    }
  };

  // If still loading, show loading state
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your health dashboard...</p>
      </div>
    );
  }

  // If not authenticated, don't render anything (will redirect)
  if (!isAuthenticated) {
    return null;
  }

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
        Welcome back, {user?.name}! Track and manage your vital health metrics.
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

      {/* Urgent Health Concerns Checklist */}
      <div className="urgent-concerns-section">
        <h2>Urgent Health Concerns</h2>
        <div className="concerns-list">
          {savedReports.map(report => {
            if (!report.analysis?.urgentConcerns?.length) return null;
            
            return (
              <div key={report._id} className="report-concerns">
                <h3>Report from {new Date(report.createdAt).toLocaleDateString()}</h3>
                <ul className="concerns-checklist">
                  {report.analysis.urgentConcerns.map((concern, index) => (
                    <li key={`${report._id}-${index}`} className="concern-item">
                      <label className="concern-label">
                        <input
                          type="checkbox"
                          checked={checkedConcerns[`${report._id}-${index}`] || false}
                          onChange={() => handleCheckConcern(report._id, index)}
                        />
                        <span className={checkedConcerns[`${report._id}-${index}`] ? 'checked' : ''}>
                          {concern}
                        </span>
                      </label>
                      <button 
                        className="delete-concern-btn"
                        onClick={() => handleDeleteConcern(report._id, index)}
                        title="Delete concern"
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
          {savedReports.every(report => !report.analysis?.urgentConcerns?.length) && (
            <p className="no-concerns">No urgent concerns found in your reports.</p>
          )}
        </div>
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

      {error && <div className="error-message">{error}</div>}
      
      <div className="saved-reports-section">
        <h2>Saved Reports</h2>
        <div className="reports-grid">
          {savedReports.map(report => (
            <div key={report._id} className="report-card">
              <h3>{report.createdAt ? new Date(report.createdAt).toLocaleDateString() : 'Unnamed Report'}</h3>
              <div className="report-actions">
                <button onClick={() => handleReportClick(report)}>
                  View Details
                </button>
                <button 
                  className="delete-button"
                  onClick={() => handleDeleteReport(report._id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
          {savedReports.length === 0 && (
            <p>No saved reports found.</p>
          )}
        </div>
      </div>

      {selectedReport && (
        <div className="report-details">
          <h2>Report Details</h2>
          <div className="report-content">
            <h3>Analysis</h3>
            {selectedReport.analysis && (
              <>
                <div className="section">
                  <h4>Key Findings</h4>
                  <ul>
                    {selectedReport.analysis.keyFindings?.map((finding, index) => (
                      <li key={index}>{finding}</li>
                    ))}
                  </ul>
                </div>
                
                <div className="section">
                  <h4>Recommendations</h4>
                  <ul>
                    {selectedReport.analysis.recommendations?.map((rec, index) => (
                      <li key={index}>{rec}</li>
                    ))}
                  </ul>
                </div>
                
                <div className="section">
                  <h4>Urgent Concerns</h4>
                  <ul>
                    {selectedReport.analysis.urgentConcerns?.map((concern, index) => (
                      <li key={index}>{concern}</li>
                    ))}
                  </ul>
                </div>
                
                <div className="section">
                  <h4>Simplified Explanation</h4>
                  <p>{selectedReport.analysis.simplifiedExplanation}</p>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MyHealth;
