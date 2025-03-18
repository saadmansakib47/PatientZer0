// MyHealth.js
import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { savedReportService } from "../services/savedReportService";
import { healthMetricsService } from "../services/healthMetricsService";
import { appointmentsService } from "../services/appointmentsService";
import { medicationsService } from "../services/medicationsService";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";
import AddMetricModal from "../components/modals/AddMetricModal";
import AddMedicationModal from "../components/modals/AddMedicationModal";
import BookAppointmentModal from "../components/modals/BookAppointmentModal";
import ReportDetailsModal from "../components/modals/ReportDetailsModal";
import "./MyHealth.css";

const MyHealth = () => {
  const { isAuthenticated, loading: authLoading, user } = useAuth();
  const navigate = useNavigate();

  // State management
  const [activeTab, setActiveTab] = useState("overview");
  const [healthMetrics, setHealthMetrics] = useState([]);
  const [healthGoals, setHealthGoals] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [medications, setMedications] = useState([]);
  const [savedReports, setSavedReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [showAddMetricModal, setShowAddMetricModal] = useState(false);
  const [showAddMedicationModal, setShowAddMedicationModal] = useState(false);
  const [showBookAppointmentModal, setShowBookAppointmentModal] =
    useState(false);

  // Authentication check
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || (!authLoading && !isAuthenticated)) {
      navigate("/login");
    }
  }, [authLoading, isAuthenticated, navigate]);

  // Data fetching
  useEffect(() => {
    if (isAuthenticated) {
      fetchAllData();
    }
  }, [isAuthenticated]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [metrics, goals, appts, meds, reports] = await Promise.all([
        healthMetricsService.getHealthMetrics(),
        healthMetricsService.getHealthGoals(),
        appointmentsService.getAppointments(),
        medicationsService.getMedications(),
        savedReportService.getAllSavedReports(),
      ]);

      setHealthMetrics(metrics);
      setHealthGoals(goals);
      setAppointments(appts);
      setMedications(meds);
      setSavedReports(reports);
    } catch (err) {
      setError("Failed to fetch health data");
    } finally {
      setLoading(false);
    }
  };

  // Event handlers
  const handleAddMetric = async (metricData) => {
    try {
      await healthMetricsService.updateHealthMetrics(metricData);
      fetchAllData();
      setShowAddMetricModal(false);
    } catch (err) {
      setError("Failed to add metric");
    }
  };

  const handleAddMedication = async (medicationData) => {
    try {
      await medicationsService.addMedication(medicationData);
      fetchAllData();
      setShowAddMedicationModal(false);
    } catch (err) {
      setError("Failed to add medication");
    }
  };

  const handleBookAppointment = async (appointmentData) => {
    try {
      await appointmentsService.createAppointment(appointmentData);
      fetchAllData();
      setShowBookAppointmentModal(false);
    } catch (err) {
      setError("Failed to book appointment");
    }
  };

  const handleTrackMedication = async (medicationId, intakeData) => {
    try {
      await medicationsService.trackMedicationIntake(medicationId, intakeData);
      fetchAllData();
    } catch (err) {
      setError("Failed to track medication");
    }
  };

  const handleDeleteMedication = async (medicationId) => {
    if (window.confirm("Are you sure you want to delete this medication?")) {
      try {
        await medicationsService.deleteMedication(medicationId);
        fetchAllData();
      } catch (err) {
        setError("Failed to delete medication");
      }
    }
  };

  const handleRescheduleAppointment = async (appointmentId) => {
    try {
      // For now, just show the booking modal with pre-filled data
      const appointment = appointments.find((a) => a.id === appointmentId);
      if (appointment) {
        setShowBookAppointmentModal(true);
      }
    } catch (err) {
      setError("Failed to reschedule appointment");
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    if (window.confirm("Are you sure you want to cancel this appointment?")) {
      try {
        await appointmentsService.deleteAppointment(appointmentId);
        fetchAllData();
      } catch (err) {
        setError("Failed to cancel appointment");
      }
    }
  };

  const handleDeleteReport = async (reportId) => {
    if (window.confirm("Are you sure you want to delete this report?")) {
      try {
        await savedReportService.deleteSavedReport(reportId);
        setSavedReports(
          savedReports.filter((report) => report._id !== reportId)
        );
        if (selectedReport?._id === reportId) {
          setSelectedReport(null);
        }
      } catch (err) {
        setError("Failed to delete report");
      }
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your health dashboard...</p>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="my-health">
      <header className="my-health-header">
        <h1 className="my-health-title">My Health Dashboard</h1>
        <p className="my-health-subtitle">
          Welcome back, {user?.name}! Track and manage your vital health
          metrics.
        </p>
        <nav className="health-nav">
          <button
            className={`nav-btn ${activeTab === "overview" ? "active" : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            Overview
          </button>
          <button
            className={`nav-btn ${activeTab === "metrics" ? "active" : ""}`}
            onClick={() => setActiveTab("metrics")}
          >
            Health Metrics
          </button>
          <button
            className={`nav-btn ${activeTab === "medications" ? "active" : ""}`}
            onClick={() => setActiveTab("medications")}
          >
            Medications
          </button>
          <button
            className={`nav-btn ${
              activeTab === "appointments" ? "active" : ""
            }`}
            onClick={() => setActiveTab("appointments")}
          >
            Appointments
          </button>
          <button
            className={`nav-btn ${activeTab === "reports" ? "active" : ""}`}
            onClick={() => setActiveTab("reports")}
          >
            Reports
          </button>
        </nav>
      </header>

      {error && <div className="error-message">{error}</div>}

      <main className="health-content">
        {activeTab === "overview" && (
          <div className="overview-section">
            {/* Quick Stats */}
            <div className="quick-stats">
              {healthMetrics.slice(0, 4).map((metric, index) => (
                <div className="stat-card" key={index}>
                  <div className="stat-icon">{metric.icon}</div>
                  <div className="stat-details">
                    <h3>{metric.title}</h3>
                    <p className="stat-value">{metric.value}</p>
                    <p className="stat-trend">
                      {metric.trend > 0 ? "↑" : "↓"} {Math.abs(metric.trend)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Health Trends Chart */}
            <div className="health-trends">
              <h2>Health Trends</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={healthMetrics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="#8884d8" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Next Appointments */}
            <div className="upcoming-appointments">
              <h2>Upcoming Appointments</h2>
              <div className="appointment-cards">
                {appointments.slice(0, 3).map((appointment, index) => (
                  <div className="appointment-card" key={index}>
                    <div className="appointment-date">
                      {format(new Date(appointment.date), "MMM dd, yyyy")}
                    </div>
                    <div className="appointment-details">
                      <h4>{appointment.doctorName}</h4>
                      <p>{appointment.specialty}</p>
                      <p>{format(new Date(appointment.date), "hh:mm a")}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button
                className="action-btn"
                onClick={() => setShowBookAppointmentModal(true)}
              >
                Book New Appointment
              </button>
            </div>

            {/* Medication Reminders */}
            <div className="medication-reminders">
              <h2>Today's Medications</h2>
              <div className="medication-list">
                {medications.map((medication, index) => (
                  <div className="medication-item" key={index}>
                    <div className="medication-info">
                      <h4>{medication.name}</h4>
                      <p>
                        {medication.dosage} - {medication.frequency}
                      </p>
                    </div>
                    <button
                      className="track-btn"
                      onClick={() =>
                        handleTrackMedication(medication.id, { taken: true })
                      }
                    >
                      Mark as Taken
                    </button>
                  </div>
                ))}
              </div>
              <button
                className="action-btn"
                onClick={() => setShowAddMedicationModal(true)}
              >
                Add New Medication
              </button>
            </div>
          </div>
        )}

        {activeTab === "metrics" && (
          <div className="metrics-section">
            {/* Detailed metrics view */}
            <div className="metrics-grid">
              {healthMetrics.map((metric, index) => (
                <div className="metric-card detailed" key={index}>
                  <div className="metric-header">
                    <div className="metric-icon">{metric.icon}</div>
                    <h3>{metric.title}</h3>
                  </div>
                  <div className="metric-chart">
                    <ResponsiveContainer width="100%" height={150}>
                      <LineChart data={metric.history}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke="#8884d8"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="metric-stats">
                    <div className="stat">
                      <label>Current</label>
                      <value>{metric.value}</value>
                    </div>
                    <div className="stat">
                      <label>Average</label>
                      <value>{metric.average}</value>
                    </div>
                    <div className="stat">
                      <label>Target</label>
                      <value>{metric.target}</value>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button
              className="action-btn"
              onClick={() => setShowAddMetricModal(true)}
            >
              Add New Metric
            </button>
          </div>
        )}

        {activeTab === "medications" && (
          <div className="medications-section">
            <div className="medications-grid">
              {medications.map((medication, index) => (
                <div className="medication-card" key={index}>
                  <h3>{medication.name}</h3>
                  <div className="medication-details">
                    <p>
                      <strong>Dosage:</strong> {medication.dosage}
                    </p>
                    <p>
                      <strong>Frequency:</strong> {medication.frequency}
                    </p>
                    <p>
                      <strong>Start Date:</strong>{" "}
                      {format(new Date(medication.startDate), "MMM dd, yyyy")}
                    </p>
                    <p>
                      <strong>End Date:</strong>{" "}
                      {medication.endDate
                        ? format(new Date(medication.endDate), "MMM dd, yyyy")
                        : "Ongoing"}
                    </p>
                  </div>
                  <div className="medication-adherence">
                    <h4>Adherence Rate</h4>
                    <div className="progress-bar">
                      <div
                        className="progress"
                        style={{ width: `${medication.adherenceRate}%` }}
                      ></div>
                    </div>
                    <p>{medication.adherenceRate}%</p>
                  </div>
                  <div className="medication-actions">
                    <button
                      onClick={() =>
                        handleTrackMedication(medication.id, { taken: true })
                      }
                    >
                      Mark as Taken
                    </button>
                    <button
                      onClick={() => handleDeleteMedication(medication.id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button
              className="action-btn"
              onClick={() => setShowAddMedicationModal(true)}
            >
              Add New Medication
            </button>
          </div>
        )}

        {activeTab === "appointments" && (
          <div className="appointments-section">
            <div className="appointments-timeline">
              {appointments.map((appointment, index) => (
                <div className="appointment-item" key={index}>
                  <div className="appointment-time">
                    <div className="date">
                      {format(new Date(appointment.date), "MMM dd")}
                    </div>
                    <div className="time">
                      {format(new Date(appointment.date), "hh:mm a")}
                    </div>
                  </div>
                  <div className="appointment-content">
                    <h3>{appointment.doctorName}</h3>
                    <p>{appointment.specialty}</p>
                    <p>{appointment.location}</p>
                    <div className="appointment-actions">
                      <button
                        onClick={() =>
                          handleRescheduleAppointment(appointment.id)
                        }
                      >
                        Reschedule
                      </button>
                      <button
                        onClick={() => handleCancelAppointment(appointment.id)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button
              className="action-btn"
              onClick={() => setShowBookAppointmentModal(true)}
            >
              Book New Appointment
            </button>
          </div>
        )}

        {activeTab === "reports" && (
          <div className="reports-section">
            <div className="reports-grid">
              {savedReports.map((report) => (
                <div className="report-card" key={report._id}>
                  <h3>{format(new Date(report.createdAt), "MMM dd, yyyy")}</h3>
                  <div className="report-preview">
                    <p>
                      {report.analysis?.simplifiedExplanation?.substring(
                        0,
                        100
                      )}
                      ...
                    </p>
                  </div>
                  <div className="report-actions">
                    <button onClick={() => setSelectedReport(report)}>
                      View Details
                    </button>
                    <button onClick={() => handleDeleteReport(report._id)}>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      {showAddMetricModal && (
        <AddMetricModal
          onClose={() => setShowAddMetricModal(false)}
          onSubmit={handleAddMetric}
        />
      )}

      {showAddMedicationModal && (
        <AddMedicationModal
          onClose={() => setShowAddMedicationModal(false)}
          onSubmit={handleAddMedication}
        />
      )}

      {showBookAppointmentModal && (
        <BookAppointmentModal
          onClose={() => setShowBookAppointmentModal(false)}
          onSubmit={handleBookAppointment}
        />
      )}

      {selectedReport && (
        <ReportDetailsModal
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
        />
      )}
    </div>
  );
};

export default MyHealth;
