import { jwtDecode } from 'jwt-decode';

export const getPatientIdFromToken = (token) => {
    if (!token) return null;
    try {
        const decoded = jwtDecode(token);
        return decoded._id || null; // Changed from patientId to _id to match our JWT structure
    } catch (error) {
        console.error('Error decoding token:', error);
        return null;
    }
};

export const getUserRole = (token) => {
    if (!token) return null;
    try {
        const decoded = jwtDecode(token);
        return decoded.role || null;
    } catch (error) {
        console.error('Error decoding token:', error);
        return null;
    }
};
