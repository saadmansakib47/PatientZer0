// ScanReport.js
import React, { useState } from "react";
import "./ScanReport.css";

const ScanReport = () => {
  const [uploadedScans, setUploadedScans] = useState([
    {
      id: 1,
      name: "MRI Scan - Brain",
      date: "2024-10-01",
      imageUrl: "path/to/image1.jpg",
    },
    {
      id: 2,
      name: "CT Scan - Chest",
      date: "2024-09-15",
      imageUrl: "path/to/image2.jpg",
    },
  ]);

  const [reportSummary, setReportSummary] = useState("");
  const [newScan, setNewScan] = useState(null);
  const [testType, setTestType] = useState("");
  const [reportType, setReportType] = useState("");
  const [treatmentSuggestions, setTreatmentSuggestions] = useState("");

  const handleUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setNewScan(file);
      alert("New scan uploaded successfully.");
    }
  };

  const handleSummaryChange = (event) => {
    setReportSummary(event.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Submit functionality here
    alert("Report submitted successfully.");
  };

  return (
    <div className="scan-report-container">
      <h1 className="scan-report-title">Scan Report</h1>
      <p className="scan-report-subtitle">
        Review and upload your medical scans
      </p>

      {/* Uploaded Scans Section */}
      <div className="uploaded-scans">
        <h2>Uploaded Scans</h2>
        <div className="scans-gallery">
          {uploadedScans.map((scan) => (
            <div className="scan-item" key={scan.id}>
              <img
                src={scan.imageUrl}
                alt={scan.name}
                className="scan-thumbnail"
              />
              <div className="scan-details">
                <p className="scan-name">{scan.name}</p>
                <p className="scan-date">Uploaded on: {scan.date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Report Form Section */}
      <form className="report-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Select Test Type</label>
          <select
            value={testType}
            onChange={(e) => setTestType(e.target.value)}
            required
          >
            <option value="">Choose a test type</option>
            <option value="MRI">MRI</option>
            <option value="CT">CT Scan</option>
            <option value="X-ray">X-ray</option>
            {/* Add more options as needed */}
          </select>
        </div>

        <div className="form-group">
          <label>Report Type</label>
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            required
          >
            <option value="">Choose report type</option>
            <option value="Routine Checkup">Routine Checkup</option>
            <option value="Follow-up">Follow-up</option>
            <option value="Diagnostic">Diagnostic</option>
          </select>
        </div>

        <div className="form-group">
          <label>Upload Medical Report</label>
          <input type="file" onChange={handleUpload} required />
          {newScan && <p>Uploaded File: {newScan.name}</p>}
        </div>

        <div className="form-group">
          <label>Enter Treatment Suggestions</label>
          <textarea
            placeholder="Enter treatment suggestions here..."
            value={treatmentSuggestions}
            onChange={(e) => setTreatmentSuggestions(e.target.value)}
            required
          ></textarea>
        </div>

        <button type="submit" className="submit-btn">
          Submit
        </button>
      </form>

      {/* Report Summary Section */}
      <div className="report-summary">
        <h2>Report Summary</h2>
        <textarea
          placeholder="Enter doctor's notes or comments here..."
          value={reportSummary}
          onChange={handleSummaryChange}
        ></textarea>
      </div>
    </div>
  );
};

export default ScanReport;
