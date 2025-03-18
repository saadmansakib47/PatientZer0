import axiosInstance from "../utils/axiosInstance";

const API_URL = "";

export const appointmentsService = {
  // Get all appointments
  getAppointments: async () => {
    const response = await axiosInstance.get(`${API_URL}/api/health/appointments`);
    return response.data;
  },

  // Create new appointment
  createAppointment: async (appointmentData) => {
    const response = await axiosInstance.post(
      `${API_URL}/api/health/appointments`,
      appointmentData
    );
    return response.data;
  },

  // Update appointment
  updateAppointment: async (id, appointmentData) => {
    const response = await axiosInstance.put(
      `${API_URL}/api/health/appointments/${id}`,
      appointmentData
    );
    return response.data;
  },

  // Delete appointment
  deleteAppointment: async (id) => {
    const response = await axiosInstance.delete(
      `${API_URL}/api/health/appointments/${id}`
    );
    return response.data;
  },
};
