import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";

const DoctorDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({
    totalAppointments: 0,
    todayAppointments: 0,
    pendingAppointments: 0,
    totalPatients: 0,
    totalPrescriptions: 0,
    averageRating: 0,
  });
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      loadMockData();
      setLoading(false);
    }, 1000);
  }, []);

  const loadMockData = () => {
    // Sample statistics
    setStats({
      totalAppointments: 24,
      todayAppointments: 5,
      pendingAppointments: 3,
      totalPatients: 18,
      totalPrescriptions: 42,
      averageRating: 4.8,
    });

    // Sample recent appointments
    setRecentAppointments([
      {
        _id: "app1",
        patient: { name: "John Doe", _id: "pat1" },
        date: new Date(2023, 6, 15),
        time: "10:00 AM",
        status: "completed",
        reason: "Regular checkup",
      },
      {
        _id: "app2",
        patient: { name: "Jane Smith", _id: "pat2" },
        date: new Date(2023, 6, 14),
        time: "2:30 PM",
        status: "completed",
        reason: "Follow-up consultation",
      },
      {
        _id: "app3",
        patient: { name: "Robert Johnson", _id: "pat3" },
        date: new Date(2023, 6, 13),
        time: "11:15 AM",
        status: "cancelled",
        reason: "Acute fever and cough",
      },
    ]);

    // Sample upcoming appointments
    setUpcomingAppointments([
      {
        _id: "app4",
        patient: { name: "Emma Wilson", _id: "pat4" },
        date: new Date(2023, 6, 20),
        time: "9:00 AM",
        status: "scheduled",
        reason: "Annual physical exam",
      },
      {
        _id: "app5",
        patient: { name: "Michael Brown", _id: "pat5" },
        date: new Date(2023, 6, 21),
        time: "1:45 PM",
        status: "scheduled",
        reason: "Chronic pain management",
      },
    ]);
  };

  const handleAppointmentStatusChange = async (appointmentId, newStatus) => {
    // Simulate API call
    setTimeout(() => {
      const updatedUpcoming = upcomingAppointments.filter(
        (app) => app._id !== appointmentId
      );
      setUpcomingAppointments(updatedUpcoming);

      toast.success(`Appointment marked as ${newStatus}`);

      // Update stats
      setStats({
        ...stats,
        pendingAppointments: stats.pendingAppointments - 1,
      });
    }, 500);
  };

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

  const welcomeMessage = user?.name
    ? `Welcome, Dr. ${user.name.split(" ")[0]}!`
    : "Welcome, Doctor!";

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">{welcomeMessage}</h1>
          <p className="text-gray-600">Here's your practice overview</p>
        </div>
        <div className="text-sm text-gray-500">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-gray-500 text-sm font-medium">
            Total Appointments
          </h3>
          <p className="text-2xl font-bold text-gray-900">
            {stats.totalAppointments}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-gray-500 text-sm font-medium">
            Today's Appointments
          </h3>
          <p className="text-2xl font-bold text-gray-900">
            {stats.todayAppointments}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-gray-500 text-sm font-medium">
            Pending Appointments
          </h3>
          <p className="text-2xl font-bold text-gray-900">
            {stats.pendingAppointments}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-gray-500 text-sm font-medium">Total Patients</h3>
          <p className="text-2xl font-bold text-gray-900">
            {stats.totalPatients}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-gray-500 text-sm font-medium">Prescriptions</h3>
          <p className="text-2xl font-bold text-gray-900">
            {stats.totalPrescriptions}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-gray-500 text-sm font-medium">Average Rating</h3>
          <p className="text-2xl font-bold text-gray-900">
            {stats.averageRating.toFixed(1)}{" "}
            <span className="text-yellow-500">★</span>
          </p>
        </div>
      </div>

      {/* Recent and Upcoming Appointments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Appointments */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Recent Appointments</h2>
            <Link
              to="/doctor/schedule"
              className="text-blue-500 text-sm hover:underline"
            >
              View All
            </Link>
          </div>

          <div className="space-y-4">
            {recentAppointments.map((appointment) => (
              <div key={appointment._id} className="border-b pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{appointment.patient.name}</p>
                    <p className="text-sm text-gray-500">
                      {appointment.date.toLocaleDateString()} at{" "}
                      {appointment.time}
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

                <p className="text-sm text-gray-600 mt-2">
                  {appointment.reason}
                </p>
              </div>
            ))}

            {recentAppointments.length === 0 && (
              <p className="text-gray-500 text-center py-4">
                No recent appointments
              </p>
            )}
          </div>
        </div>

        {/* Upcoming Appointments */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Upcoming Appointments</h2>
            <Link
              to="/doctor/schedule"
              className="text-blue-500 text-sm hover:underline"
            >
              View Schedule
            </Link>
          </div>

          <div className="space-y-4">
            {upcomingAppointments.map((appointment) => (
              <div key={appointment._id} className="border-b pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{appointment.patient.name}</p>
                    <p className="text-sm text-gray-500">
                      {appointment.date.toLocaleDateString()} at{" "}
                      {appointment.time}
                    </p>
                  </div>
                  <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                    Scheduled
                  </span>
                </div>

                <p className="text-sm text-gray-600 mt-2">
                  {appointment.reason}
                </p>

                <div className="flex space-x-2 mt-4">
                  <button
                    onClick={() =>
                      handleAppointmentStatusChange(
                        appointment._id,
                        "completed"
                      )
                    }
                    className="px-3 py-1 bg-green-500 text-white rounded-md text-sm hover:bg-green-600"
                  >
                    Complete
                  </button>
                  <button
                    onClick={() =>
                      handleAppointmentStatusChange(
                        appointment._id,
                        "cancelled"
                      )
                    }
                    className="px-3 py-1 bg-red-500 text-white rounded-md text-sm hover:bg-red-600"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ))}

            {upcomingAppointments.length === 0 && (
              <p className="text-gray-500 text-center py-4">
                No upcoming appointments
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <Link
          to="/doctor/schedule"
          className="bg-white rounded-lg shadow-md p-6 text-left hover:bg-gray-50 flex items-center"
        >
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-blue-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <div>
            <h3 className="font-medium text-gray-900">Manage Schedule</h3>
            <p className="text-sm text-gray-500">
              View and update your availability
            </p>
          </div>
        </Link>

        <Link
          to="/doctor/patients"
          className="bg-white rounded-lg shadow-md p-6 text-left hover:bg-gray-50 flex items-center"
        >
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-green-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <div>
            <h3 className="font-medium text-gray-900">Patient Records</h3>
            <p className="text-sm text-gray-500">Access patient information</p>
          </div>
        </Link>

        <Link
          to="/doctor/prescriptions"
          className="bg-white rounded-lg shadow-md p-6 text-left hover:bg-gray-50 flex items-center"
        >
          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-purple-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <div>
            <h3 className="font-medium text-gray-900">Prescriptions</h3>
            <p className="text-sm text-gray-500">
              Create and manage prescriptions
            </p>
          </div>
        </Link>

        <Link
          to="/doctor/profile"
          className="bg-white rounded-lg shadow-md p-6 text-left hover:bg-gray-50 flex items-center"
        >
          <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center mr-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-yellow-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>
          <div>
            <h3 className="font-medium text-gray-900">Profile Settings</h3>
            <p className="text-sm text-gray-500">
              Update your professional details
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default DoctorDashboard;
