import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { FaEye, FaDownload, FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import { toast } from "react-hot-toast";

const DoctorPrescriptions = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [prescriptions, setPrescriptions] = useState([]);
  const [patients, setPatients] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    patientId: "",
    diagnosis: "",
    notes: "",
    medications: [
      { name: "", dosage: "", frequency: "", duration: "", instructions: "" },
    ],
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      const [prescriptionsResponse, patientsResponse] = await Promise.all([
        axios.get("/api/doctor/prescriptions", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("/api/doctor/patients", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setPrescriptions(prescriptionsResponse.data);
      setPatients(patientsResponse.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to load data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleMedicationChange = (index, field, value) => {
    const updatedMedications = [...formData.medications];
    updatedMedications[index] = {
      ...updatedMedications[index],
      [field]: value,
    };

    setFormData({
      ...formData,
      medications: updatedMedications,
    });
  };

  const addMedication = () => {
    setFormData({
      ...formData,
      medications: [
        ...formData.medications,
        { name: "", dosage: "", frequency: "", duration: "", instructions: "" },
      ],
    });
  };

  const removeMedication = (index) => {
    const updatedMedications = [...formData.medications];
    updatedMedications.splice(index, 1);

    setFormData({
      ...formData,
      medications: updatedMedications,
    });
  };

  const resetForm = () => {
    setFormData({
      patientId: "",
      diagnosis: "",
      notes: "",
      medications: [
        { name: "", dosage: "", frequency: "", duration: "", instructions: "" },
      ],
    });
  };

  const handleCreatePrescription = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const prescriptionData = {
        patientId: formData.patientId,
        diagnosis: formData.diagnosis,
        notes: formData.notes,
        medications: formData.medications,
      };

      const response = await axios.post(
        "/api/doctor/prescriptions",
        prescriptionData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setPrescriptions([response.data, ...prescriptions]);
      setIsCreating(false);
      resetForm();
      toast.success("Prescription created successfully!");
    } catch (error) {
      console.error("Error creating prescription:", error);
      setError("Failed to create prescription. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditPrescription = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const prescriptionData = {
        patientId: formData.patientId,
        diagnosis: formData.diagnosis,
        notes: formData.notes,
        medications: formData.medications,
      };

      const response = await axios.put(
        `/api/doctor/prescriptions/${selectedPrescription._id}`,
        prescriptionData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const updatedPrescriptions = prescriptions.map((p) =>
        p._id === selectedPrescription._id ? response.data : p
      );

      setPrescriptions(updatedPrescriptions);
      setSelectedPrescription(null);
      resetForm();
      toast.success("Prescription updated successfully!");
    } catch (error) {
      console.error("Error updating prescription:", error);
      setError("Failed to update prescription. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePrescription = async (prescriptionId) => {
    if (!window.confirm("Are you sure you want to delete this prescription?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`/api/doctor/prescriptions/${prescriptionId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setPrescriptions(prescriptions.filter((p) => p._id !== prescriptionId));
      toast.success("Prescription deleted successfully!");
    } catch (error) {
      console.error("Error deleting prescription:", error);
      setError("Failed to delete prescription. Please try again.");
    }
  };

  const handleViewPrescription = (prescriptionId) => {
    window.open(`/api/doctor/prescriptions/${prescriptionId}/pdf`, "_blank");
  };

  const handleDownloadPrescription = (prescriptionId) => {
    window.open(
      `/api/doctor/prescriptions/${prescriptionId}/download`,
      "_blank"
    );
  };

  const editPrescription = (prescription) => {
    setSelectedPrescription(prescription);
    setFormData({
      patientId: prescription.patient._id,
      diagnosis: prescription.diagnosis,
      notes: prescription.notes || "",
      medications: prescription.medications,
    });
    setIsCreating(false);
  };

  const filteredPrescriptions = prescriptions.filter((prescription) => {
    const patientName = prescription.patient.name.toLowerCase();
    const search = searchTerm.toLowerCase();
    const diagnosis = prescription.diagnosis.toLowerCase();

    return patientName.includes(search) || diagnosis.includes(search);
  });

  if (loading && !prescriptions.length) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Prescriptions</h1>
        {!isCreating && !selectedPrescription && (
          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
          >
            <FaPlus />
            <span>New Prescription</span>
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {isCreating || selectedPrescription ? (
        <form
          onSubmit={
            selectedPrescription
              ? handleEditPrescription
              : handleCreatePrescription
          }
          className="bg-white shadow-md rounded-lg p-6 mb-6"
        >
          <h2 className="text-lg font-semibold mb-4">
            {selectedPrescription
              ? "Edit Prescription"
              : "Create New Prescription"}
          </h2>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Patient
            </label>
            <select
              name="patientId"
              value={formData.patientId}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-md shadow-sm p-2"
              required
            >
              <option value="">Select Patient</option>
              {patients.map((patient) => (
                <option key={patient._id} value={patient._id}>
                  {patient.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Diagnosis
            </label>
            <input
              type="text"
              name="diagnosis"
              value={formData.diagnosis}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-md shadow-sm p-2"
              placeholder="Primary diagnosis"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-md shadow-sm p-2"
              rows="3"
              placeholder="Additional notes or instructions"
            ></textarea>
          </div>

          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-md font-medium">Medications</h3>
              <button
                type="button"
                onClick={addMedication}
                className="text-blue-500 hover:text-blue-700"
              >
                Add Medication
              </button>
            </div>

            {formData.medications.map((medication, index) => (
              <div
                key={index}
                className="p-4 border border-gray-200 rounded-md mb-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Medication Name
                    </label>
                    <input
                      type="text"
                      value={medication.name}
                      onChange={(e) =>
                        handleMedicationChange(index, "name", e.target.value)
                      }
                      className="w-full border border-gray-300 rounded-md shadow-sm p-2"
                      placeholder="Medication name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Dosage
                    </label>
                    <input
                      type="text"
                      value={medication.dosage}
                      onChange={(e) =>
                        handleMedicationChange(index, "dosage", e.target.value)
                      }
                      className="w-full border border-gray-300 rounded-md shadow-sm p-2"
                      placeholder="e.g., 10mg"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Frequency
                    </label>
                    <input
                      type="text"
                      value={medication.frequency}
                      onChange={(e) =>
                        handleMedicationChange(
                          index,
                          "frequency",
                          e.target.value
                        )
                      }
                      className="w-full border border-gray-300 rounded-md shadow-sm p-2"
                      placeholder="e.g., Twice daily"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Duration
                    </label>
                    <input
                      type="text"
                      value={medication.duration}
                      onChange={(e) =>
                        handleMedicationChange(
                          index,
                          "duration",
                          e.target.value
                        )
                      }
                      className="w-full border border-gray-300 rounded-md shadow-sm p-2"
                      placeholder="e.g., 7 days"
                      required
                    />
                  </div>
                </div>

                <div className="mb-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Special Instructions
                  </label>
                  <input
                    type="text"
                    value={medication.instructions}
                    onChange={(e) =>
                      handleMedicationChange(
                        index,
                        "instructions",
                        e.target.value
                      )
                    }
                    className="w-full border border-gray-300 rounded-md shadow-sm p-2"
                    placeholder="e.g., Take with food"
                  />
                </div>

                {formData.medications.length > 1 && (
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => removeMedication(index)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      Remove Medication
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => {
                setIsCreating(false);
                setSelectedPrescription(null);
                resetForm();
              }}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              disabled={loading}
            >
              {loading
                ? "Saving..."
                : selectedPrescription
                ? "Update Prescription"
                : "Create Prescription"}
            </button>
          </div>
        </form>
      ) : (
        <>
          <div className="mb-6">
            <input
              type="text"
              placeholder="Search by patient name or diagnosis..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {filteredPrescriptions.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <p className="text-gray-500">
                No prescriptions found. Create a new prescription to get
                started.
              </p>
            </div>
          ) : (
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Patient
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Diagnosis
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Date
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Medications
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredPrescriptions.map((prescription) => (
                      <tr key={prescription._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              {prescription.patient.profilePhoto ? (
                                <img
                                  className="h-10 w-10 rounded-full"
                                  src={prescription.patient.profilePhoto}
                                  alt=""
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                  <span className="text-gray-500 text-lg">
                                    {prescription.patient.name.charAt(0)}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {prescription.patient.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {prescription.patient.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {prescription.diagnosis}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {new Date(
                              prescription.createdAt
                            ).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {prescription.medications.length} medications
                          </div>
                          <div className="text-sm text-gray-500">
                            {prescription.medications
                              .map((med) => med.name)
                              .join(", ")}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-3">
                            <button
                              onClick={() => editPrescription(prescription)}
                              className="text-blue-600 hover:text-blue-900"
                              title="Edit"
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() =>
                                handleViewPrescription(prescription._id)
                              }
                              className="text-green-600 hover:text-green-900"
                              title="View"
                            >
                              <FaEye />
                            </button>
                            <button
                              onClick={() =>
                                handleDownloadPrescription(prescription._id)
                              }
                              className="text-purple-600 hover:text-purple-900"
                              title="Download"
                            >
                              <FaDownload />
                            </button>
                            <button
                              onClick={() =>
                                handleDeletePrescription(prescription._id)
                              }
                              className="text-red-600 hover:text-red-900"
                              title="Delete"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default DoctorPrescriptions;
