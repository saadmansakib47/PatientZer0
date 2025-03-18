import axiosInstance from "../utils/axiosInstance";

const API_URL = "";

export const savedReportService = {
  // Get all saved reports
  getAllSavedReports: async () => {
    const response = await axiosInstance.get(`${API_URL}/api/health/reports`);
    return response.data;
  },

  // Get a single saved report (client-side filtering since backend doesn't have individual report endpoint)
  getSavedReport: async (id) => {
    const response = await axiosInstance.get(`${API_URL}/api/health/reports`);
    const report = response.data.find((report) => report._id === id);
    if (!report) {
      throw new Error("Report not found");
    }
    return report;
  },

  // Save a new report
  saveReport: async (reportData) => {
    const response = await axiosInstance.post(
      `${API_URL}/api/health/analyze-report`,
      reportData
    );
    return response.data;
  },

  // Update a saved report
  updateSavedReport: async (id, reportData) => {
    const response = await axiosInstance.put(
      `${API_URL}/api/health/reports/${id}`,
      reportData
    );
    return response.data;
  },

  // Delete a saved report
  deleteSavedReport: async (id) => {
    const response = await axiosInstance.delete(
      `${API_URL}/api/health/reports/${id}`
    );
    return response.data;
  },
};
