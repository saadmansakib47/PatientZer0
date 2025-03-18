import React from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import {
  FaHome,
  FaUserMd,
  FaUsers,
  FaCalendarAlt,
  FaPrescriptionBottleAlt,
  FaCog,
  FaSignOutAlt,
} from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";

const DoctorLayout = ({ children }) => {
  const location = useLocation();
  const { logout, user } = useAuth();

  const handleLogout = () => {
    logout();
  };

  const menuItems = [
    { path: "/doctor/dashboard", name: "Dashboard", icon: <FaHome /> },
    { path: "/doctor/profile", name: "My Profile", icon: <FaUserMd /> },
    { path: "/doctor/patients", name: "My Patients", icon: <FaUsers /> },
    { path: "/doctor/schedule", name: "Schedule", icon: <FaCalendarAlt /> },
    {
      path: "/doctor/prescriptions",
      name: "Prescriptions",
      icon: <FaPrescriptionBottleAlt />,
    },
    { path: "/doctor/settings", name: "Settings", icon: <FaCog /> },
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-full md:w-64 bg-white shadow-md">
        <div className="px-6 pt-8 pb-6 border-b">
          <h1 className="text-xl font-bold text-green-600">Doctor Panel</h1>
          {user && (
            <p className="text-sm text-gray-600 mt-1">Dr. {user.name}</p>
          )}
        </div>
        <nav className="mt-6">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-6 py-3 ${
                location.pathname === item.path
                  ? "bg-green-50 text-green-600 border-l-4 border-green-600"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <span className="text-lg mr-3">{item.icon}</span>
              <span>{item.name}</span>
            </Link>
          ))}
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-6 py-3 text-gray-600 hover:bg-gray-50"
          >
            <span className="text-lg mr-3">
              <FaSignOutAlt />
            </span>
            <span>Logout</span>
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6">{children || <Outlet />}</div>
    </div>
  );
};

export default DoctorLayout;
