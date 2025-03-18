import axiosInstance from "../utils/axiosInstance";

const API_URL = "";

export const medicationsService = {
  // Get all medications
  getMedications: async () => {
    const response = await axiosInstance.get(
      `${API_URL}/api/health/medications`
    );
    return response.data;
  },

  // Add new medication
  addMedication: async (medicationData) => {
    const response = await axiosInstance.post(
      `${API_URL}/api/health/medications`,
      medicationData
    );
    return response.data;
  },

  // Update medication
  updateMedication: async (id, medicationData) => {
    const response = await axiosInstance.put(
      `${API_URL}/api/health/medications/${id}`,
      medicationData
    );
    return response.data;
  },

  // Delete medication
  deleteMedication: async (id) => {
    const response = await axiosInstance.delete(
      `${API_URL}/api/health/medications/${id}`
    );
    return response.data;
  },

  // Track medication intake
  trackMedicationIntake: async (id, intakeData) => {
    const response = await axiosInstance.post(
      `${API_URL}/api/health/medications/${id}/track`,
      intakeData
    );
    return response.data;
  },
};
