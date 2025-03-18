import axiosInstance from '../utils/axiosInstance';

const savedReportService = {
  // Get all saved reports for the current user
  getSavedReports: async () => {
    try {
      const response = await axiosInstance.get('/saved-reports');
      return response.data;
    } catch (error) {
      console.error('Error fetching saved reports:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  // Save a new report
  saveReport: async (reportData) => {
    try {
      // Ensure the report data is properly formatted
      const formattedData = {
        name: reportData.name,
        scanData: reportData.scanData,
        scanType: reportData.scanType || 'xray', // Default to xray if not provided
        scanDate: reportData.scanDate || new Date().toISOString(),
        notes: reportData.notes || ''
      };

      console.log('Saving report with data:', formattedData); // Debug log
      const response = await axiosInstance.post('/saved-reports', formattedData);
      return response.data;
    } catch (error) {
      console.error('Error saving report:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  // Get a single report by ID
  getReportById: async (id) => {
    try {
      const response = await axiosInstance.get(`/saved-reports/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching report:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  // Update an existing report
  updateReport: async (id, reportData) => {
    try {
      const response = await axiosInstance.put(`/saved-reports/${id}`, reportData);
      return response.data;
    } catch (error) {
      console.error('Error updating report:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  // Delete a report
  deleteReport: async (id) => {
    try {
      const response = await axiosInstance.delete(`/saved-reports/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting report:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  }
};

export default savedReportService; 