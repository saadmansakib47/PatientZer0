// src/service/patientService.js
import axios from 'axios';

// Function to extract patient ID from the JWT
const getPatientIdFromToken = (token) => {
    if (!token) return null;
    const payload = JSON.parse(atob(token.split('.')[1])); // Decode the JWT payload
    return payload.patientId; // Adjust this according to your JWT structure
};

// Function to fetch patient data
const fetchPatientData = async () => {
    const token = localStorage.getItem('token'); // Get the token from local storage
    const patientId = getPatientIdFromToken(token); // Extract the patient ID from the token

    if (patientId) {
        try {
            const response = await axios.get(`http://localhost:5000/api/patients/${patientId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data; // Return the patient data
        } catch (error) {
            console.error('Error fetching patient data:', error);
            throw new Error('Failed to fetch patient data.'); // Throw an error for handling in components
        }
    } else {
        console.error('Patient ID not found or token expired');
        throw new Error('Patient ID not found or token expired'); // Throw an error if token is invalid
    }
};

export { fetchPatientData }; // Export the fetch function
