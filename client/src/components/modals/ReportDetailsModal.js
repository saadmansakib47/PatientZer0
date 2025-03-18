import React from 'react';
import { format } from 'date-fns';
import './Modal.css';

const ReportDetailsModal = ({ report, onClose }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Report Details</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        <div className="report-content">
          <div className="report-meta">
            <p className="report-date">
              Date: {format(new Date(report.createdAt), 'MMM dd, yyyy')}
            </p>
          </div>

          {report.analysis && (
            <>
              <div className="section">
                <h3>Key Findings</h3>
                <ul>
                  {report.analysis.keyFindings?.map((finding, index) => (
                    <li key={index}>{finding}</li>
                  ))}
                </ul>
              </div>
              
              <div className="section">
                <h3>Recommendations</h3>
                <ul>
                  {report.analysis.recommendations?.map((rec, index) => (
                    <li key={index}>{rec}</li>
                  ))}
                </ul>
              </div>
              
              <div className="section">
                <h3>Urgent Concerns</h3>
                {report.analysis.urgentConcerns?.length > 0 ? (
                  <ul className="urgent-list">
                    {report.analysis.urgentConcerns.map((concern, index) => (
                      <li key={index} className="urgent-item">
                        <span className="urgent-icon">⚠️</span>
                        {concern}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="no-concerns">No urgent concerns found</p>
                )}
              </div>
              
              <div className="section">
                <h3>Simplified Explanation</h3>
                <p className="explanation-text">{report.analysis.simplifiedExplanation}</p>
              </div>

              {report.analysis.attachments?.length > 0 && (
                <div className="section">
                  <h3>Attachments</h3>
                  <div className="attachments-grid">
                    {report.analysis.attachments.map((attachment, index) => (
                      <div key={index} className="attachment-item">
                        <a href={attachment.url} target="_blank" rel="noopener noreferrer">
                          {attachment.name}
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
        <div className="modal-actions">
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default ReportDetailsModal; 