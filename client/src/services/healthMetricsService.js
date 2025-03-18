import axiosInstance from "../utils/axiosInstance";

const API_URL = "";

export const healthMetricsService = {
  // Get user's health metrics
  getHealthMetrics: async () => {
    const response = await axiosInstance.get(`${API_URL}/api/health/metrics`);
    return response.data;
  },

  // Update health metrics
  updateHealthMetrics: async (metricsData) => {
    const response = await axiosInstance.post(
      `${API_URL}/api/health/metrics`,
      metricsData
    );
    return response.data;
  },

  // Get health goals
  getHealthGoals: async () => {
    const response = await axiosInstance.get(`${API_URL}/api/health/goals`);
    return response.data;
  },

  // Update health goals
  updateHealthGoals: async (goalsData) => {
    const response = await axiosInstance.put(
      `${API_URL}/api/health/goals`,
      goalsData
    );
    return response.data;
  },
};
