import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  FaHome,
  FaUser,
  FaSignOutAlt,
  FaSignInAlt,
  FaUserMd,
  FaUserCog,
  FaBars,
  FaTimes,
  FaBlog,
  FaUsers,
  FaBook,
  FaFileMedical,
  FaHeartbeat,
} from "react-icons/fa";
import "./Navbar.css";
import logo from "../assets/logo.png"; // Ensure this path is correct

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const closeMenu = () => {
    setMobileMenuOpen(false);
  };

  const renderNavLinks = () => {
    // Base links for everyone
    const links = [
      { to: "/", label: "Home", icon: <FaHome className="mr-2" /> },
      { to: "/blog", label: "Blog", icon: <FaBlog className="mr-2" /> },
      {
        to: "/community",
        label: "Community",
        icon: <FaUsers className="mr-2" />,
      },
      {
        to: "/resources",
        label: "Resources",
        icon: <FaBook className="mr-2" />,
      },
    ];

    // Add role-specific links
    if (isAuthenticated) {
      // Add My Health for all authenticated users
      links.push({
        to: "/my-health",
        label: "My Health",
        icon: <FaHeartbeat className="mr-2" />,
      });

      // Add role-specific links
      if (user?.role === "admin") {
        links.push({
          to: "/admin/doctor-verifications",
          label: "Admin Panel",
          icon: <FaUserCog className="mr-2" />,
        });
      } else if (user?.role === "doctor") {
        links.push({
          to: "/doctor/dashboard",
          label: "Doctor Panel",
          icon: <FaUserMd className="mr-2" />,
        });
      }

      // Add scan report for patients only
      if (user?.role === "patient" || !user?.role) {
        links.push({
          to: "/scan-report",
          label: "Scan Report",
          icon: <FaFileMedical className="mr-2" />,
        });
      }
    }

    return links.map((link) => (
      <Link
        key={link.to}
        to={link.to}
        className="flex items-center px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-md"
        onClick={closeMenu}
      >
        {link.icon}
        {link.label}
      </Link>
    ));
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <img
                src={logo}
                alt="PatientZer0 Logo"
                className="h-8 w-auto mr-2"
              />
              <span className="text-xl font-bold text-blue-600">
                PatientZer0
              </span>
            </Link>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            <div className="flex space-x-4">{renderNavLinks()}</div>
            <div className="ml-4 flex items-center">
              {isAuthenticated ? (
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium text-gray-700">
                    {user?.name || "User"}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <FaSignOutAlt className="mr-2" />
                    Logout
                  </button>
                </div>
              ) : (
                <div className="space-x-2">
                  <Link
                    to="/login"
                    className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-blue-600 hover:bg-blue-50"
            >
              {mobileMenuOpen ? (
                <FaTimes className="h-6 w-6" />
              ) : (
                <FaBars className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {renderNavLinks()}
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200">
            <div className="flex items-center px-5">
              {isAuthenticated ? (
                <div className="w-full">
                  <div className="text-base font-medium text-gray-800">
                    {user?.name || "User"}
                  </div>
                  <div className="text-sm font-medium text-gray-500">
                    {user?.email || ""}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="mt-3 w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <FaSignOutAlt className="mr-2" />
                    Logout
                  </button>
                </div>
              ) : (
                <div className="w-full space-y-2">
                  <Link
                    to="/login"
                    className="w-full flex justify-center px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800"
                    onClick={closeMenu}
                  >
                    <FaSignInAlt className="mr-2" />
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="w-full flex justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                    onClick={closeMenu}
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
