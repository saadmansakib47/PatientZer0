import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

const DoctorPatients = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [medicalHistory, setMedicalHistory] = useState([]);
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    if (selectedPatient) {
      fetchPatientDetails(selectedPatient._id);
    }
  }, [selectedPatient]);

  const fetchPatients = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://localhost:5001/api/doctors/patients",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setPatients(response.data);
    } catch (error) {
      console.error("Error fetching patients:", error);
      setError("Failed to load patients. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchPatientDetails = async (patientId) => {
    try {
      const token = localStorage.getItem("token");
      const [historyResponse, appointmentsResponse] = await Promise.all([
        axios.get(
          `http://localhost:5001/api/doctors/patients/${patientId}/medical-history`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        ),
        axios.get(
          `http://localhost:5001/api/doctors/patients/${patientId}/appointments`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        ),
      ]);

      setMedicalHistory(historyResponse.data);
      setAppointments(appointmentsResponse.data);
    } catch (error) {
      console.error("Error fetching patient details:", error);
      setError("Failed to load patient details. Please try again.");
    }
  };

  const filteredPatients = patients.filter(
    (patient) =>
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.phone?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Patient Management</h1>

      {/* Search Bar */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search patients by name, email, or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patient List */}
        <div className="lg:col-span-1">
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Patients</h2>

            <div className="space-y-2">
              {filteredPatients.map((patient) => (
                <button
                  key={patient._id}
                  onClick={() => setSelectedPatient(patient)}
                  className={`w-full text-left p-3 rounded-md ${
                    selectedPatient?._id === patient._id
                      ? "bg-blue-50 border border-blue-200"
                      : "hover:bg-gray-50 border border-transparent"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      {patient.profilePhoto ? (
                        <img
                          src={patient.profilePhoto}
                          alt={patient.name}
                          className="h-10 w-10 rounded-full"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-500 text-lg">
                            {patient.name.charAt(0)}
                          </span>
                        </div>
                      )}
                    </div>

                    <div>
                      <p className="font-medium text-gray-900">
                        {patient.name}
                      </p>
                      <p className="text-sm text-gray-500">{patient.email}</p>
                    </div>
                  </div>
                </button>
              ))}

              {filteredPatients.length === 0 && (
                <p className="text-gray-500 text-center py-4">
                  No patients found
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Patient Details */}
        {selectedPatient && (
          <div className="lg:col-span-2">
            <div className="bg-white shadow-md rounded-lg p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-lg font-semibold">
                    {selectedPatient.name}
                  </h2>
                  <p className="text-gray-500">{selectedPatient.email}</p>
                </div>

                <div className="flex space-x-2">
                  <button className="px-3 py-1 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600">
                    New Appointment
                  </button>
                  <button className="px-3 py-1 bg-green-500 text-white rounded-md text-sm hover:bg-green-600">
                    Write Prescription
                  </button>
                </div>
              </div>

              {/* Patient Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Phone</h3>
                  <p className="mt-1">
                    {selectedPatient.phone || "Not provided"}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Date of Birth
                  </h3>
                  <p className="mt-1">
                    {selectedPatient.dateOfBirth
                      ? new Date(
                          selectedPatient.dateOfBirth
                        ).toLocaleDateString()
                      : "Not provided"}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">Gender</h3>
                  <p className="mt-1">
                    {selectedPatient.gender || "Not provided"}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Blood Group
                  </h3>
                  <p className="mt-1">
                    {selectedPatient.bloodGroup || "Not provided"}
                  </p>
                </div>
              </div>

              {/* Medical History */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4">Medical History</h3>

                <div className="space-y-4">
                  {medicalHistory.map((record, index) => (
                    <div key={index} className="border-b pb-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{record.condition}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(record.date).toLocaleDateString()}
                          </p>
                        </div>
                        <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
                          {record.status}
                        </span>
                      </div>

                      <p className="text-sm text-gray-600 mt-2">
                        {record.notes}
                      </p>
                    </div>
                  ))}

                  {medicalHistory.length === 0 && (
                    <p className="text-gray-500 text-center py-4">
                      No medical history available
                    </p>
                  )}
                </div>
              </div>

              {/* Recent Appointments */}
              <div>
                <h3 className="text-lg font-semibold mb-4">
                  Recent Appointments
                </h3>

                <div className="space-y-4">
                  {appointments.map((appointment) => (
                    <div key={appointment._id} className="border-b pb-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">
                            {new Date(appointment.date).toLocaleDateString()} at{" "}
                            {appointment.time}
                          </p>
                          <p className="text-sm text-gray-500">
                            {appointment.reason}
                          </p>
                        </div>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            appointment.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : appointment.status === "cancelled"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {appointment.status.charAt(0).toUpperCase() +
                            appointment.status.slice(1)}
                        </span>
                      </div>

                      {appointment.notes && (
                        <p className="text-sm text-gray-600 mt-2">
                          {appointment.notes}
                        </p>
                      )}
                    </div>
                  ))}

                  {appointments.length === 0 && (
                    <p className="text-gray-500 text-center py-4">
                      No appointments found
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorPatients;
