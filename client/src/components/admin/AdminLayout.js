import React from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import { FaUserMd, FaUsers, FaSignOutAlt } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";

const AdminLayout = () => {
  const location = useLocation();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  const menuItems = [
    {
      path: "/admin/doctor-verifications",
      name: "Doctor Verifications",
      icon: <FaUserMd />,
    },
    { path: "/admin/users", name: "User Management", icon: <FaUsers /> },
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-full md:w-64 bg-white shadow-md">
        <div className="px-6 pt-8 pb-6 border-b">
          <h1 className="text-xl font-bold text-blue-600">Admin Panel</h1>
        </div>
        <nav className="mt-6">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-6 py-3 ${
                location.pathname === item.path
                  ? "bg-blue-50 text-blue-600 border-l-4 border-blue-600"
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
      <div className="flex-1 overflow-auto p-6">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;
