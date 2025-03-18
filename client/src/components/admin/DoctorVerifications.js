import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-hot-toast";
import {
  FaCheckCircle,
  FaTimesCircle,
  FaEye,
  FaDownload,
  FaSync,
} from "react-icons/fa";

const DoctorVerifications = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeView, setActiveView] = useState("pending");
  const [currentDoctor, setCurrentDoctor] = useState(null);
  const [comment, setComment] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState("");
  const { token } = useAuth();

  useEffect(() => {
    fetchDoctors();
  }, [activeView]);

  const fetchDoctors = async () => {
    try {
      setLoading(true);

      // Debug token
      console.log(
        "Fetching doctors with token:",
        token ? "Token exists" : "No token"
      );

      // Get token from localStorage as fallback
      const authToken = token || localStorage.getItem("token");

      if (!authToken) {
        console.error("No authentication token available");
        setError("Authentication error. Please log in again.");
        setLoading(false);
        return;
      }

      console.log(
        `Making request to: http://localhost:5001/api/admin/doctors?status=${activeView}`
      );

      const response = await axios.get(
        `http://localhost:5001/api/admin/doctors?status=${activeView}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      console.log("API Response:", response.data);

      if (Array.isArray(response.data)) {
        setDoctors(response.data);
        console.log(
          `Loaded ${response.data.length} doctors with status ${activeView}`
        );
      } else {
        console.error(
          "Invalid response format, expected array:",
          response.data
        );
        setDoctors([]);
      }

      setError(null);
    } catch (err) {
      console.error("Error fetching doctors:", err);
      setError(
        err.response?.data?.message || "Failed to fetch doctor verifications"
      );
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (doctor, action) => {
    setCurrentDoctor(doctor);
    setModalAction(action);
    setComment("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentDoctor(null);
    setModalAction("");
    setComment("");
  };

  const handleVerification = async () => {
    if (!currentDoctor || !modalAction) return;

    try {
      // Get token from localStorage as fallback
      const authToken = token || localStorage.getItem("token");

      if (!authToken) {
        toast.error("Authentication error. Please log in again.");
        return;
      }

      const endpoint =
        modalAction === "approve"
          ? `/api/admin/doctors/${currentDoctor._id}/approve`
          : `/api/admin/doctors/${currentDoctor._id}/reject`;

      await axios.post(
        `http://localhost:5001${endpoint}`,
        { comment },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      toast.success(
        `Doctor ${
          modalAction === "approve" ? "approved" : "rejected"
        } successfully`
      );
      closeModal();
      fetchDoctors();
    } catch (err) {
      console.error("Error during verification:", err);
      toast.error(
        err.response?.data?.message ||
          `Failed to ${modalAction} doctor verification`
      );
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
        <strong className="font-bold">Error: </strong>
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Doctor Verifications</h1>

      {/* Status Tabs */}
      <div className="flex mb-6 border-b">
        <button
          onClick={() => setActiveView("pending")}
          className={`px-4 py-2 ${
            activeView === "pending"
              ? "border-b-2 border-blue-500 text-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Pending
        </button>
        <button
          onClick={() => setActiveView("approved")}
          className={`px-4 py-2 ${
            activeView === "approved"
              ? "border-b-2 border-blue-500 text-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Approved
        </button>
        <button
          onClick={() => setActiveView("rejected")}
          className={`px-4 py-2 ${
            activeView === "rejected"
              ? "border-b-2 border-blue-500 text-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Rejected
        </button>
      </div>

      {doctors.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No {activeView} doctor verifications found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map((doctor) => (
            <DoctorCard
              key={doctor._id}
              doctor={doctor}
              activeView={activeView}
              openModal={openModal}
            />
          ))}
        </div>
      )}

      {/* Verification Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-semibold mb-4">
              {modalAction === "approve"
                ? "Approve Doctor Registration"
                : "Reject Doctor Registration"}
            </h3>
            <p className="mb-4">
              {modalAction === "approve"
                ? "Are you sure you want to approve this doctor's registration?"
                : "Please provide a reason for rejecting this doctor's registration:"}
            </p>
            <textarea
              className="w-full border rounded p-2 mb-4"
              rows="3"
              placeholder={
                modalAction === "approve"
                  ? "Optional: Add comments"
                  : "Reason for rejection (required)"
              }
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required={modalAction === "reject"}
            ></textarea>
            <div className="flex justify-end space-x-2">
              <button
                onClick={closeModal}
                className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleVerification}
                className={`px-4 py-2 rounded text-white ${
                  modalAction === "approve"
                    ? "bg-green-500 hover:bg-green-600"
                    : "bg-red-500 hover:bg-red-600"
                }`}
                disabled={modalAction === "reject" && !comment.trim()}
              >
                {modalAction === "approve" ? "Approve" : "Reject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const DoctorCard = ({ doctor, activeView, openModal }) => {
  const [expanded, setExpanded] = useState(false);

  const toggleExpand = () => {
    setExpanded(!expanded);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Get status badge color
  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold">{doctor.name}</h3>
          <span
            className={`text-xs px-2 py-1 rounded-full ${getStatusBadge(
              doctor.additionalInfo?.verificationStatus
            )}`}
          >
            {doctor.additionalInfo?.verificationStatus?.toUpperCase() ||
              "PENDING"}
          </span>
        </div>
        <p className="text-gray-600 text-sm mb-2">{doctor.email}</p>
        <p className="text-gray-600 text-sm mb-2">
          {doctor.additionalInfo?.specialization || "No specialization"}
        </p>

        {expanded && (
          <div className="mt-4 border-t pt-4">
            <h4 className="font-semibold text-sm mb-2">Doctor Details</h4>

            {/* Qualifications */}
            <div className="mb-3">
              <h5 className="text-xs font-semibold text-gray-500 mb-1">
                Qualifications:
              </h5>
              {doctor.additionalInfo?.qualifications?.length > 0 ? (
                <ul className="list-disc pl-5 text-sm">
                  {doctor.additionalInfo.qualifications.map((qual, idx) => (
                    <li key={idx}>
                      {qual.degree} from {qual.institution} ({qual.year})
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">
                  No qualifications listed
                </p>
              )}
            </div>

            {/* Experience */}
            <div className="mb-3">
              <h5 className="text-xs font-semibold text-gray-500 mb-1">
                Experience:
              </h5>
              {doctor.additionalInfo?.experience?.length > 0 ? (
                <ul className="list-disc pl-5 text-sm">
                  {doctor.additionalInfo.experience.map((exp, idx) => (
                    <li key={idx}>
                      {exp.position} at {exp.hospital} ({exp.years} years)
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">No experience listed</p>
              )}
            </div>

            {/* Certificates */}
            <div className="mb-3">
              <h5 className="text-xs font-semibold text-gray-500 mb-1">
                Certificates:
              </h5>
              {doctor.additionalInfo?.bmdcCertificate ||
              doctor.additionalInfo?.degreeCertificate ? (
                <div className="grid grid-cols-2 gap-2">
                  {doctor.additionalInfo?.bmdcCertificate && (
                    <a
                      href={`http://localhost:5001/${doctor.additionalInfo.bmdcCertificate}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline text-sm"
                    >
                      View BMDC Certificate
                    </a>
                  )}
                  {doctor.additionalInfo?.degreeCertificate && (
                    <a
                      href={`http://localhost:5001/${doctor.additionalInfo.degreeCertificate}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline text-sm"
                    >
                      View Degree Certificate
                    </a>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  No certificates uploaded
                </p>
              )}
            </div>

            {/* Previous comments */}
            {doctor.additionalInfo?.verificationComments?.length > 0 && (
              <div className="mb-3">
                <h5 className="text-xs font-semibold text-gray-500 mb-1">
                  Previous Comments:
                </h5>
                <ul className="text-sm space-y-2">
                  {doctor.additionalInfo.verificationComments.map(
                    (comment, idx) => (
                      <li
                        key={idx}
                        className={`p-2 rounded ${
                          comment.status === "approved"
                            ? "bg-green-50"
                            : "bg-red-50"
                        }`}
                      >
                        <div className="flex justify-between">
                          <span
                            className={`font-semibold ${
                              comment.status === "approved"
                                ? "text-green-700"
                                : "text-red-700"
                            }`}
                          >
                            {comment.status.toUpperCase()}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatDate(comment.date)}
                          </span>
                        </div>
                        <p>{comment.text}</p>
                        <p className="text-xs text-gray-500">
                          By: {comment.adminName}
                        </p>
                      </li>
                    )
                  )}
                </ul>
              </div>
            )}
          </div>
        )}

        <div className="mt-4 flex flex-col space-y-2">
          <button
            onClick={toggleExpand}
            className="text-blue-500 hover:text-blue-700 text-sm"
          >
            {expanded ? "Show Less" : "Show More"}
          </button>

          {activeView === "pending" && (
            <div className="flex space-x-2 mt-2">
              <button
                onClick={() => openModal(doctor, "approve")}
                className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 flex-1"
              >
                Approve
              </button>
              <button
                onClick={() => openModal(doctor, "reject")}
                className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 flex-1"
              >
                Reject
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorVerifications;
