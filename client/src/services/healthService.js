import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Health Metrics
export const healthMetricService = {
  getAllMetrics: async () => {
    const response = await api.get('/health-metrics');
    return response.data;
  },
  createMetric: async (metricData) => {
    const response = await api.post('/health-metrics', metricData);
    return response.data;
  },
  updateMetric: async (id, metricData) => {
    const response = await api.put(`/health-metrics/${id}`, metricData);
    return response.data;
  },
  deleteMetric: async (id) => {
    const response = await api.delete(`/health-metrics/${id}`);
    return response.data;
  }
};

// Health Goals
export const healthGoalService = {
  getAllGoals: async () => {
    const response = await api.get('/health-goals');
    return response.data;
  },
  createGoal: async (goalData) => {
    const response = await api.post('/health-goals', goalData);
    return response.data;
  },
  updateGoal: async (id, goalData) => {
    const response = await api.put(`/health-goals/${id}`, goalData);
    return response.data;
  },
  deleteGoal: async (id) => {
    const response = await api.delete(`/health-goals/${id}`);
    return response.data;
  },
  updateProgress: async (id, progress) => {
    const response = await api.patch(`/health-goals/${id}/progress`, { currentProgress: progress });
    return response.data;
  }
};

// Appointments
export const appointmentService = {
  getAllAppointments: async () => {
    const response = await api.get('/appointments');
    return response.data;
  },
  getUpcomingAppointments: async () => {
    const response = await api.get('/appointments/upcoming');
    return response.data;
  },
  createAppointment: async (appointmentData) => {
    const response = await api.post('/appointments', appointmentData);
    return response.data;
  },
  updateAppointment: async (id, appointmentData) => {
    const response = await api.put(`/appointments/${id}`, appointmentData);
    return response.data;
  },
  deleteAppointment: async (id) => {
    const response = await api.delete(`/appointments/${id}`);
    return response.data;
  }
};

// Health Activities
export const healthActivityService = {
  getAllActivities: async () => {
    const response = await api.get('/health-activities');
    return response.data;
  },
  getRecentActivities: async () => {
    const response = await api.get('/health-activities/recent');
    return response.data;
  },
  createActivity: async (activityData) => {
    const response = await api.post('/health-activities', activityData);
    return response.data;
  },
  updateActivity: async (id, activityData) => {
    const response = await api.put(`/health-activities/${id}`, activityData);
    return response.data;
  },
  deleteActivity: async (id) => {
    const response = await api.delete(`/health-activities/${id}`);
    return response.data;
  }
}; 