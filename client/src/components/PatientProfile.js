// src/components/PatientProfile.js
import React, { useEffect, useState } from 'react';
import { fetchPatientData } from '../service/patientService';
import './PatientProfile.css'; // This should match the file name and location
 // Import the CSS file

const PatientProfile = () => {
    const [patientData, setPatientData] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const getPatientData = async () => {
            try {
                const data = await fetchPatientData();
                setPatientData(data);
            } catch (err) {
                setError(err.message);
            }
        };

        getPatientData();
    }, []);

    return (
        <div className="patient-profile">
            {error && <p className="error-message">{error}</p>}
            {patientData ? (
                <div className="profile-details">
                    <h1>{patientData.name}</h1>
                    <p><strong>Email:</strong> {patientData.email}</p>
                    <p><strong>Role:</strong> {patientData.role}</p>
                    {patientData.additionalInfo && (
                        <>
                            {patientData.additionalInfo.age && <p><strong>Age:</strong> {patientData.additionalInfo.age}</p>}
                            {patientData.additionalInfo.gender && <p><strong>Gender:</strong> {patientData.additionalInfo.gender}</p>}
                            {patientData.additionalInfo.country && <p><strong>Country:</strong> {patientData.additionalInfo.country}</p>}
                            {patientData.additionalInfo.state && <p><strong>State:</strong> {patientData.additionalInfo.state}</p>}
                        </>
                    )}
                </div>
            ) : (
                <p>Loading...</p>
            )}
        </div>
    );
};

export default PatientProfile;
