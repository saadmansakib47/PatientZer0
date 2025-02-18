// src/axiosInstance.js
import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: 'http://localhost:5000/api', // Adjust base URL as needed
});

// Add a request interceptor to include the token in headers
axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem('token'); // Get the token from localStorage
    if (token) {
        config.headers.Authorization = `Bearer ${token}`; // Set the Authorization header
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default axiosInstance;
