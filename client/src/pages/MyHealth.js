// MyHealth.js
import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import savedReportService from '../services/savedReportService';
import { healthMetricService, healthGoalService, appointmentService, healthActivityService } from '../services/healthService';
import "./MyHealth.css";

const MyHealth = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [healthMetrics, setHealthMetrics] = useState([]);
  const [healthGoals, setHealthGoals] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [savedReports, setSavedReports] = useState([]);
  const [showAddMetricModal, setShowAddMetricModal] = useState(false);
  const [showAddGoalModal, setShowAddGoalModal] = useState(false);
  const [showAddAppointmentModal, setShowAddAppointmentModal] = useState(false);
  const [showAddReportModal, setShowAddReportModal] = useState(false);
  const [newMetric, setNewMetric] = useState({ type: '', value: '', unit: '', notes: '' });
  const [newGoal, setNewGoal] = useState({ title: '', target: '', unit: '', targetDate: '', notes: '' });
  const [newAppointment, setNewAppointment] = useState({ doctorName: '', specialization: '', date: '', time: '', notes: '' });
  const [newReport, setNewReport] = useState({ name: '', scanType: '', scanDate: '', notes: '' });

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    fetchAllData();
  }, [user, navigate]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [reports, metrics, goals, upcomingAppointments, activities] = await Promise.all([
        savedReportService.getSavedReports(),
        healthMetricService.getAllMetrics(),
        healthGoalService.getAllGoals(),
        appointmentService.getUpcomingAppointments(),
        healthActivityService.getRecentActivities()
      ]);

      setSavedReports(reports);
      setHealthMetrics(metrics);
      setHealthGoals(goals);
      setAppointments(upcomingAppointments);
      setRecentActivities(activities);
      setError("");
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const handleAddReport = async (e) => {
    e.preventDefault();
    try {
      await savedReportService.saveReport(newReport);
      const updatedReports = await savedReportService.getSavedReports();
      setSavedReports(updatedReports);
      setShowAddReportModal(false);
      setNewReport({ name: '', scanType: '', scanDate: '', notes: '' });
    } catch (err) {
      setError('Failed to add report');
    }
  };

  const handleDeleteReport = async (reportId) => {
    if (window.confirm('Are you sure you want to delete this report?')) {
      try {
        await savedReportService.deleteReport(reportId);
        setSavedReports(savedReports.filter(report => report._id !== reportId));
      } catch (err) {
        setError('Failed to delete report');
      }
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="my-health">
      <h1 className="my-health-title">My Health Dashboard</h1>
      
      {/* Saved Reports Section */}
      <section className="saved-reports-section">
        <div className="section-header">
          <h2>Saved Reports</h2>
          <button className="add-button" onClick={() => setShowAddReportModal(true)}>
            Add Report
          </button>
        </div>
        {savedReports.length > 0 ? (
          <div className="reports-grid">
            {savedReports.map((report) => (
              <div key={report._id} className="report-card">
                <div className="report-header">
                  <h3>{report.name}</h3>
                  <button
                    className="delete-button"
                    onClick={() => handleDeleteReport(report._id)}
                  >
                    ×
                  </button>
                </div>
                <div className="report-content">
                  <p><strong>Type:</strong> {report.scanType}</p>
                  <p><strong>Date:</strong> {new Date(report.scanDate).toLocaleDateString()}</p>
                  {report.notes && <p><strong>Notes:</strong> {report.notes}</p>}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-data">No saved reports yet</p>
        )}
      </section>

      {/* Health Metrics Section */}
      <section className="health-metrics-section">
        <div className="section-header">
          <h2>Health Metrics</h2>
          <button className="add-button" onClick={() => setShowAddMetricModal(true)}>
            Add Metric
          </button>
        </div>
        {healthMetrics.length > 0 ? (
          <div className="metrics-grid">
            {healthMetrics.map((metric) => (
              <div key={metric._id} className="metric-card">
                <div className="metric-header">
                  <h3>{metric.type}</h3>
                  <span className="metric-value">{metric.value} {metric.unit}</span>
                </div>
                <p className="metric-date">
                  {new Date(metric.date).toLocaleDateString()}
                </p>
                {metric.notes && <p className="metric-notes">{metric.notes}</p>}
              </div>
            ))}
          </div>
        ) : (
          <p className="no-data">No health metrics recorded yet</p>
        )}
      </section>

      {/* Health Goals Section */}
      <section className="health-goals-section">
        <div className="section-header">
          <h2>Health Goals</h2>
          <button className="add-button" onClick={() => setShowAddGoalModal(true)}>
            Add Goal
          </button>
        </div>
        {healthGoals.length > 0 ? (
          <div className="goals-grid">
            {healthGoals.map((goal) => (
              <div key={goal._id} className="goal-card">
                <h3>{goal.title}</h3>
                <div className="goal-progress">
                  <div 
                    className="progress-bar"
                    style={{ width: `${(goal.currentValue / goal.targetValue) * 100}%` }}
                  ></div>
                </div>
                <p className="goal-target">
                  Target: {goal.targetValue} {goal.unit}
                </p>
                <p className="goal-deadline">
                  Deadline: {new Date(goal.targetDate).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-data">No health goals set yet</p>
        )}
      </section>

      {/* Upcoming Appointments Section */}
      <section className="appointments-section">
        <div className="section-header">
          <h2>Upcoming Appointments</h2>
          <button className="add-button" onClick={() => setShowAddAppointmentModal(true)}>
            Add Appointment
          </button>
        </div>
        {appointments.length > 0 ? (
          <div className="appointments-list">
            {appointments.map((appointment) => (
              <div key={appointment._id} className="appointment-card">
                <div className="appointment-header">
                  <h3>{appointment.doctorName}</h3>
                  <span className="appointment-specialization">
                    {appointment.specialization}
                  </span>
                </div>
                <p className="appointment-date">
                  {new Date(appointment.date).toLocaleDateString()} at {appointment.time}
                </p>
                {appointment.notes && (
                  <p className="appointment-notes">{appointment.notes}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="no-data">No upcoming appointments</p>
        )}
      </section>

      {/* Recent Activities Section */}
      <section className="recent-activities-section">
        <h2>Recent Activities</h2>
        {recentActivities.length > 0 ? (
          <div className="activities-list">
            {recentActivities.map((activity) => (
              <div key={activity._id} className="activity-card">
                <div className="activity-header">
                  <h3>{activity.type}</h3>
                  <span className="activity-date">
                    {new Date(activity.date).toLocaleDateString()}
                  </span>
                </div>
                <p className="activity-description">{activity.description}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-data">No recent activities</p>
        )}
      </section>

      {/* Add Report Modal */}
      {showAddReportModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Add New Report</h2>
            <form onSubmit={handleAddReport}>
              <div className="form-group">
                <label>Report Name</label>
                <input
                  type="text"
                  value={newReport.name}
                  onChange={(e) => setNewReport({ ...newReport, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Scan Type</label>
                <select
                  value={newReport.scanType}
                  onChange={(e) => setNewReport({ ...newReport, scanType: e.target.value })}
                  required
                >
                  <option value="">Select Type</option>
                  <option value="xray">X-Ray</option>
                  <option value="mri">MRI</option>
                  <option value="ct">CT Scan</option>
                  <option value="ultrasound">Ultrasound</option>
                </select>
              </div>
              <div className="form-group">
                <label>Scan Date</label>
                <input
                  type="date"
                  value={newReport.scanDate}
                  onChange={(e) => setNewReport({ ...newReport, scanDate: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Notes</label>
                <textarea
                  value={newReport.notes}
                  onChange={(e) => setNewReport({ ...newReport, notes: e.target.value })}
                />
              </div>
              <div className="modal-actions">
                <button type="submit" className="submit-button">Save Report</button>
                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => setShowAddReportModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default MyHealth;
