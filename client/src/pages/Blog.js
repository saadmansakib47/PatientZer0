import React from 'react';
import { Routes, Route, Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import BlogList from '../components/BlogList';
import BlogDetail from '../components/BlogDetail';
import BlogSubmissionForm from '../components/BlogSubmissionForm';
import './Blog.css';

const Blog = () => {
  const { user } = useAuth();

  return (
    <div className="blog-page">
      <div className="blog-header">
        <h1>Health & Wellness Blog</h1>
        {user && (
          <Link to="new" className="create-blog-button">
            Create New Post
          </Link>
        )}
      </div>

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
    </div>
  );
};

export default Blog;
