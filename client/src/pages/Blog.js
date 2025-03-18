import React, { useState, useEffect } from "react";
import { Routes, Route, Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import BlogList from "../components/BlogList";
import BlogDetail from "../components/BlogDetail";
import BlogSubmissionForm from "../components/BlogSubmissionForm";
import "./Blog.css";

// Two blog options: integrated or embedded
const BLOG_OPTIONS = {
  INTEGRATED: "integrated", // Original PatientZer0 blog
  EMBEDDED: "embedded", // External Blogging-Site-main
};

const Blog = () => {
  const { user, isAuthenticated } = useAuth();
  const [blogOption, setBlogOption] = useState(BLOG_OPTIONS.INTEGRATED);
  const [blogToken, setBlogToken] = useState("");
  const navigate = useNavigate();

  // This effect transfers the authentication token to the embedded blog
  useEffect(() => {
    if (blogOption === BLOG_OPTIONS.EMBEDDED && isAuthenticated) {
      // Get the authentication token from local storage
      const token = localStorage.getItem("token");
      if (token) {
        setBlogToken(token);
      }
    }
  }, [blogOption, isAuthenticated]);

  return (
    <div className="blog-page">
      <div className="blog-header">
        <h1>Health & Wellness Blog</h1>
        <div className="blog-options">
          <button
            className={`blog-option-btn ${
              blogOption === BLOG_OPTIONS.INTEGRATED ? "active" : ""
            }`}
            onClick={() => setBlogOption(BLOG_OPTIONS.INTEGRATED)}
          >
            PatientZer0 Blog
          </button>
          <button
            className={`blog-option-btn ${
              blogOption === BLOG_OPTIONS.EMBEDDED ? "active" : ""
            }`}
            onClick={() => setBlogOption(BLOG_OPTIONS.EMBEDDED)}
          >
            Community Blog
          </button>
        </div>
        {user && blogOption === BLOG_OPTIONS.INTEGRATED && (
          <Link to="new" className="create-blog-button">
            Create New Post
          </Link>
        )}
      </div>

      {blogOption === BLOG_OPTIONS.INTEGRATED ? (
        // Original PatientZer0 blog
        <Routes>
          <Route index element={<BlogList />} />
          <Route
            path="new"
            element={
              user ? <BlogSubmissionForm /> : <Navigate to="/login" replace />
            }
          />
          <Route
            path="edit/:id"
            element={
              user ? <BlogSubmissionForm /> : <Navigate to="/login" replace />
            }
          />
          <Route path=":id" element={<BlogDetail />} />
        </Routes>
      ) : (
        // Embedded blog from Blogging-Site-main
        <div className="embedded-blog-container">
          <iframe
            src="http://localhost:3001"
            title="Community Blog"
            className="blog-iframe"
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
          />
        </div>
      )}
    </div>
  );
};

export default Blog;
