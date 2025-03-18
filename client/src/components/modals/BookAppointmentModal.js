import React, { useState } from "react";
import "./Modal.css";

const BookAppointmentModal = ({ onClose, onSubmit }) => {
  const [appointmentData, setAppointmentData] = useState({
    doctorName: "",
    specialty: "",
    date: "",
    time: "",
    location: "",
    reason: "",
    notes: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const dateTime = new Date(
      `${appointmentData.date}T${appointmentData.time}`
    );
    onSubmit({
      ...appointmentData,
      date: dateTime.toISOString(),
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Book New Appointment</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Doctor Name</label>
            <input
              type="text"
              value={appointmentData.doctorName}
              onChange={(e) =>
                setAppointmentData({
                  ...appointmentData,
                  doctorName: e.target.value,
                })
              }
              required
            />
          </div>
          <div className="form-group">
            <label>Specialty</label>
            <input
              type="text"
              value={appointmentData.specialty}
              onChange={(e) =>
                setAppointmentData({
                  ...appointmentData,
                  specialty: e.target.value,
                })
              }
              required
            />
          </div>
          <div className="form-group">
            <label>Date</label>
            <input
              type="date"
              value={appointmentData.date}
              onChange={(e) =>
                setAppointmentData({ ...appointmentData, date: e.target.value })
              }
              required
              min={new Date().toISOString().split("T")[0]}
            />
          </div>
          <div className="form-group">
            <label>Time</label>
            <input
              type="time"
              value={appointmentData.time}
              onChange={(e) =>
                setAppointmentData({ ...appointmentData, time: e.target.value })
              }
              required
            />
          </div>
          <div className="form-group">
            <label>Location</label>
            <input
              type="text"
              value={appointmentData.location}
              onChange={(e) =>
                setAppointmentData({
                  ...appointmentData,
                  location: e.target.value,
                })
              }
              required
            />
          </div>
          <div className="form-group">
            <label>Reason for Visit</label>
            <textarea
              value={appointmentData.reason}
              onChange={(e) =>
                setAppointmentData({
                  ...appointmentData,
                  reason: e.target.value,
                })
              }
              required
            />
          </div>
          <div className="form-group">
            <label>Additional Notes</label>
            <textarea
              value={appointmentData.notes}
              onChange={(e) =>
                setAppointmentData({
                  ...appointmentData,
                  notes: e.target.value,
                })
              }
            />
          </div>
          <div className="modal-actions">
            <button type="button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit">Book Appointment</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookAppointmentModal;
