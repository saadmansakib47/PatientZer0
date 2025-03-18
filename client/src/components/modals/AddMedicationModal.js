import React, { useState } from "react";
import "./Modal.css";

const AddMedicationModal = ({ onClose, onSubmit }) => {
  const [medicationData, setMedicationData] = useState({
    name: "",
    dosage: "",
    frequency: "",
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
    instructions: "",
    reminders: true,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(medicationData);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Add New Medication</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Medication Name</label>
            <input
              type="text"
              value={medicationData.name}
              onChange={(e) =>
                setMedicationData({ ...medicationData, name: e.target.value })
              }
              required
            />
          </div>
          <div className="form-group">
            <label>Dosage</label>
            <input
              type="text"
              value={medicationData.dosage}
              onChange={(e) =>
                setMedicationData({ ...medicationData, dosage: e.target.value })
              }
              required
              placeholder="e.g., 500mg"
            />
          </div>
          <div className="form-group">
            <label>Frequency</label>
            <input
              type="text"
              value={medicationData.frequency}
              onChange={(e) =>
                setMedicationData({
                  ...medicationData,
                  frequency: e.target.value,
                })
              }
              required
              placeholder="e.g., Twice daily"
            />
          </div>
          <div className="form-group">
            <label>Start Date</label>
            <input
              type="date"
              value={medicationData.startDate}
              onChange={(e) =>
                setMedicationData({
                  ...medicationData,
                  startDate: e.target.value,
                })
              }
              required
            />
          </div>
          <div className="form-group">
            <label>End Date (Optional)</label>
            <input
              type="date"
              value={medicationData.endDate}
              onChange={(e) =>
                setMedicationData({
                  ...medicationData,
                  endDate: e.target.value,
                })
              }
            />
          </div>
          <div className="form-group">
            <label>Special Instructions</label>
            <textarea
              value={medicationData.instructions}
              onChange={(e) =>
                setMedicationData({
                  ...medicationData,
                  instructions: e.target.value,
                })
              }
              placeholder="e.g., Take with food"
            />
          </div>
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={medicationData.reminders}
                onChange={(e) =>
                  setMedicationData({
                    ...medicationData,
                    reminders: e.target.checked,
                  })
                }
              />
              Enable Reminders
            </label>
          </div>
          <div className="modal-actions">
            <button type="button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit">Add Medication</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMedicationModal;
