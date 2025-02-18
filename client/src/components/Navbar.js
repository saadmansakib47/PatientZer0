import React from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Navbar.css";
import logo from "../assets/logo.png"; // Ensure this path is correct

const Navbar = ({ darkMode, toggleDarkMode }) => {
  const { user, logout } = useAuth();

  return (
    <nav className={`navbar ${darkMode ? "dark" : ""}`}>
      <div className="navbar-container">
        <div className="navbar-logo">
          <Link to="/" className="logo-link">
            <img src={logo} alt="PatientZer0 Logo" className="logo-image" />
            <span className="logo-text">PatientZer0</span>
          </Link>
        </div>
        <ul className="navbar-links">
          <li>
            <NavLink to="/my-health" activeClassName="active">
              My Health
            </NavLink>
          </li>
          <li>
            <NavLink to="/scan-report" activeClassName="active">
              Scan Report
            </NavLink>
          </li>
          <li>
            <NavLink to="/blog" activeClassName="active">
              Blog
            </NavLink>
          </li>
          <li>
            <NavLink to="/community" activeClassName="active">
              Community
            </NavLink>
          </li>
          <li>
            <NavLink to="/resources" activeClassName="active">
              Resources
            </NavLink>
          </li>
        </ul>
        <div className="navbar-actions">
          {user ? (
            <>
              <span className="navbar-user">Welcome, {user.name}</span>
              <button className="auth-btn" onClick={logout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="auth-btn">
                Sign In
              </Link>
              <Link to="/signup" className="auth-btn join-btn">
                Join Now
              </Link>
            </>
          )}
          {/* Dark Mode Toggle Switch */}
          <div className="dark-mode-toggle" onClick={toggleDarkMode}>
            <div className={`toggle-switch ${darkMode ? "dark" : ""}`}>
              <span className="toggle-thumb">{darkMode ? "🌙" : "🌞"}</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
