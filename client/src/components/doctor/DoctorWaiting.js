import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  FaUserMd,
  FaCheckCircle,
  FaSpinner,
  FaExclamationTriangle,
  FaSignOutAlt,
} from "react-icons/fa";

const DoctorWaiting = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <div className="bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <FaUserMd className="text-6xl mx-auto text-blue-500 mb-4" />
          <h1 className="text-3xl font-bold mb-2">
            Doctor Registration Pending
          </h1>
          <p className="text-gray-600 text-lg">
            Thank you for registering as a healthcare provider
          </p>
        </div>

        <div className="bg-blue-50 p-6 rounded-lg mb-8">
          <div className="flex items-center justify-center">
            <FaSpinner className="animate-spin text-blue-500 mr-3 text-xl" />
            <p className="text-lg font-medium">
              Your registration is currently pending administrative review
            </p>
          </div>

          <div className="mt-4 text-left">
            <p className="text-gray-700 mb-4">
              Our team is reviewing your credentials and documentation. This
              process typically takes 1-3 business days. You'll receive an email
              notification once your account is approved.
            </p>

            <div className="border-t border-blue-200 pt-4 mt-4">
              <h3 className="font-bold text-lg mb-2">What happens next?</h3>
              <ul className="list-disc pl-5 space-y-2">
                <li>Admin verification of your BMDC registration</li>
                <li>Review of your medical credentials</li>
                <li>Approval of your doctor profile</li>
                <li>Email notification when your account is activated</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="border border-gray-200 rounded-lg p-4">
            <FaCheckCircle className="text-green-500 text-2xl mx-auto mb-2" />
            <h3 className="font-semibold mb-1">Registration Submitted</h3>
            <p className="text-sm text-gray-600">
              Your application has been received
            </p>
          </div>

          <div className="border border-blue-200 bg-blue-50 rounded-lg p-4">
            <FaSpinner className="animate-spin text-blue-500 text-2xl mx-auto mb-2" />
            <h3 className="font-semibold mb-1">Verification In Progress</h3>
            <p className="text-sm text-gray-600">
              We're currently reviewing your documents
            </p>
          </div>

          <div className="border border-gray-200 rounded-lg p-4 opacity-50">
            <FaCheckCircle className="text-gray-400 text-2xl mx-auto mb-2" />
            <h3 className="font-semibold mb-1">Account Activation</h3>
            <p className="text-sm text-gray-600">
              Pending verification approval
            </p>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4 mb-8 flex items-start">
          <FaExclamationTriangle className="text-yellow-500 text-xl mt-1 mr-3 flex-shrink-0" />
          <p className="text-sm text-left">
            Need to update your registration information or have questions?
            Please contact our support team at{" "}
            <a
              href="mailto:support@patientzer0.com"
              className="text-blue-600 hover:underline"
            >
              support@patientzer0.com
            </a>
            with your registered email and BMDC number.
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center justify-center mx-auto px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
        >
          <FaSignOutAlt className="mr-2" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default DoctorWaiting;
