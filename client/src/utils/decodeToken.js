import { jwtDecode } from 'jwt-decode'; // Corrected import

export const getPatientIdFromToken = (token) => {
    if (!token) return null;
    try {
        const decoded = jwtDecode(token);
        return decoded.patientId || null; // Ensure property matches your JWT structure
    } catch (error) {
        console.error('Error decoding token:', error);
        return null;
    }
};

export const getUserRole = (token) => {
    if (!token) return null;
    try {
        const decoded = jwtDecode(token);
        return decoded.role || null; // Ensure property matches your JWT structure
    } catch (error) {
        console.error('Error decoding token:', error);
        return null;
    }
};
