import axiosInstance from "../utils/axiosInstance";

// Health Metrics API
const getHealthMetrics = async (filters = {}) => {
  try {
    const response = await axiosInstance.get("/health/metrics", {
      params: filters,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching health metrics:", error);
    throw new Error("Failed to fetch health metrics");
  }
};

const getLatestMetrics = async () => {
  try {
    const response = await axiosInstance.get("/health/metrics/latest");
    return response.data;
  } catch (error) {
    console.error("Error fetching latest metrics:", error);
    throw new Error("Failed to fetch latest metrics");
  }
};

const getMetricById = async (id) => {
  try {
    const response = await axiosInstance.get(`/health/metrics/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching metric:", error);
    throw new Error("Failed to fetch metric");
  }
};

const createMetric = async (metricData) => {
  try {
    const response = await axiosInstance.post("/health/metrics", metricData);
    return response.data;
  } catch (error) {
    console.error("Error creating metric:", error);
    throw new Error("Failed to create metric");
  }
};

const updateMetric = async (id, metricData) => {
  try {
    const response = await axiosInstance.put(
      `/health/metrics/${id}`,
      metricData
    );
    return response.data;
  } catch (error) {
    console.error("Error updating metric:", error);
    throw new Error("Failed to update metric");
  }
};

const deleteMetric = async (id) => {
  try {
    const response = await axiosInstance.delete(`/health/metrics/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting metric:", error);
    throw new Error("Failed to delete metric");
  }
};

// Health Goals API
const getHealthGoals = async (filters = {}) => {
  try {
    const response = await axiosInstance.get("/health/goals", {
      params: filters,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching health goals:", error);
    throw new Error("Failed to fetch health goals");
  }
};

const getGoalById = async (id) => {
  try {
    const response = await axiosInstance.get(`/health/goals/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching goal:", error);
    throw new Error("Failed to fetch goal");
  }
};

const createGoal = async (goalData) => {
  try {
    const response = await axiosInstance.post("/health/goals", goalData);
    return response.data;
  } catch (error) {
    console.error("Error creating goal:", error);
    throw new Error("Failed to create goal");
  }
};

const updateGoal = async (id, goalData) => {
  try {
    const response = await axiosInstance.put(`/health/goals/${id}`, goalData);
    return response.data;
  } catch (error) {
    console.error("Error updating goal:", error);
    throw new Error("Failed to update goal");
  }
};

const updateGoalProgress = async (id, progress) => {
  try {
    const response = await axiosInstance.patch(`/health/goals/${id}/progress`, {
      currentProgress: progress,
    });
    return response.data;
  } catch (error) {
    console.error("Error updating goal progress:", error);
    throw new Error("Failed to update goal progress");
  }
};

const deleteGoal = async (id) => {
  try {
    const response = await axiosInstance.delete(`/health/goals/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting goal:", error);
    throw new Error("Failed to delete goal");
  }
};

// Health Activities API
const getHealthActivities = async (filters = {}) => {
  try {
    const response = await axiosInstance.get("/health/activities", {
      params: filters,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching health activities:", error);
    throw new Error("Failed to fetch health activities");
  }
};

const getActivityById = async (id) => {
  try {
    const response = await axiosInstance.get(`/health/activities/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching activity:", error);
    throw new Error("Failed to fetch activity");
  }
};

const createActivity = async (activityData) => {
  try {
    const response = await axiosInstance.post(
      "/health/activities",
      activityData
    );
    return response.data;
  } catch (error) {
    console.error("Error creating activity:", error);
    throw new Error("Failed to create activity");
  }
};

const updateActivity = async (id, activityData) => {
  try {
    const response = await axiosInstance.put(
      `/health/activities/${id}`,
      activityData
    );
    return response.data;
  } catch (error) {
    console.error("Error updating activity:", error);
    throw new Error("Failed to update activity");
  }
};

const deleteActivity = async (id) => {
  try {
    const response = await axiosInstance.delete(`/health/activities/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting activity:", error);
    throw new Error("Failed to delete activity");
  }
};

// Helper functions for common metric types
const addHeartRateMetric = async (value, date = new Date(), notes = "") => {
  return createMetric({
    type: "heartRate",
    value,
    unit: "bpm",
    date,
    notes,
  });
};

const addBloodPressureMetric = async (
  systolic,
  diastolic,
  date = new Date(),
  notes = ""
) => {
  return createMetric({
    type: "bloodPressure",
    value: { systolic, diastolic },
    unit: "mmHg",
    date,
    notes,
  });
};

const addBloodSugarMetric = async (value, date = new Date(), notes = "") => {
  return createMetric({
    type: "bloodSugar",
    value,
    unit: "mg/dL",
    date,
    notes,
  });
};

const addWeightMetric = async (value, date = new Date(), notes = "") => {
  return createMetric({
    type: "weight",
    value,
    unit: "kg",
    date,
    notes,
  });
};

const addStepsMetric = async (value, date = new Date(), notes = "") => {
  return createMetric({
    type: "steps",
    value,
    unit: "steps",
    date,
    notes,
  });
};

export const healthService = {
  // Metrics
  getHealthMetrics,
  getLatestMetrics,
  getMetricById,
  createMetric,
  updateMetric,
  deleteMetric,

  // Goals
  getHealthGoals,
  getGoalById,
  createGoal,
  updateGoal,
  updateGoalProgress,
  deleteGoal,

  // Activities
  getHealthActivities,
  getActivityById,
  createActivity,
  updateActivity,
  deleteActivity,

  // Helper functions
  addHeartRateMetric,
  addBloodPressureMetric,
  addBloodSugarMetric,
  addWeightMetric,
  addStepsMetric,
};
