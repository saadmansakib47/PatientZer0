import React, { useState } from "react";
import "./Modal.css";

const AddMetricModal = ({ onClose, onSubmit }) => {
  const [metricData, setMetricData] = useState({
    title: "",
    value: "",
    unit: "",
    date: new Date().toISOString().split("T")[0],
    notes: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(metricData);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Add New Health Metric</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Metric Title</label>
            <input
              type="text"
              value={metricData.title}
              onChange={(e) =>
                setMetricData({ ...metricData, title: e.target.value })
              }
              required
            />
          </div>
          <div className="form-group">
            <label>Value</label>
            <input
              type="number"
              value={metricData.value}
              onChange={(e) =>
                setMetricData({ ...metricData, value: e.target.value })
              }
              required
            />
          </div>
          <div className="form-group">
            <label>Unit</label>
            <input
              type="text"
              value={metricData.unit}
              onChange={(e) =>
                setMetricData({ ...metricData, unit: e.target.value })
              }
              required
            />
          </div>
          <div className="form-group">
            <label>Date</label>
            <input
              type="date"
              value={metricData.date}
              onChange={(e) =>
                setMetricData({ ...metricData, date: e.target.value })
              }
              required
            />
          </div>
          <div className="form-group">
            <label>Notes</label>
            <textarea
              value={metricData.notes}
              onChange={(e) =>
                setMetricData({ ...metricData, notes: e.target.value })
              }
            />
          </div>
          <div className="modal-actions">
            <button type="button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit">Add Metric</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMetricModal;
