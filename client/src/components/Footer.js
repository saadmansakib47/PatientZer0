import React from "react";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>Company</h3>
          <ul>
            <li>About us</li>
            <li>Privacy and Security</li>
            <li>Press</li>
            <li>Blog</li>
            <li>Funding</li>
            <li>Careers</li>
            <li>Team of Advisors</li>
          </ul>
        </div>
        <div className="footer-section">
          <h3>Work With Us</h3>
          <ul>
            <li>Our Partners</li>
            <li>Research Publications</li>
          </ul>
        </div>
        <div className="footer-section">
          <h3>Support</h3>
          <ul>
            <li>Contact Us</li>
            <li>Crisis Resources</li>
            <li>Help Center</li>
            <li>User Agreement</li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© 2024 PatientZer0. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
