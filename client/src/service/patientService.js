// src/service/patientService.js
import axiosInstance from '../utils/axiosInstance';

// Function to extract patient ID from the JWT
const getPatientIdFromToken = (token) => {
    if (!token) return null;
    const payload = JSON.parse(atob(token.split('.')[1])); // Decode the JWT payload
    return payload.patientId; // Adjust this according to your JWT structure
};

// Function to fetch patient data
const fetchPatientData = async () => {
    try {
        const response = await axiosInstance.get('/auth/profile');
        return response.data;
    } catch (error) {
        console.error('Error fetching patient data:', error);
        throw new Error('Failed to fetch patient data.');
    }
};

export { fetchPatientData }; // Export the fetch function
