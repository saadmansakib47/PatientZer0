import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';
import './BlogList.css';

const BlogList = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('');

  const fetchBlogs = async () => {
    try {
      const response = await axiosInstance.get('/blogs');
      setBlogs(response.data.blogs);
      setTotalPages(response.data.totalPages);
    } catch (err) {
      setError('Failed to fetch blog posts. Please try again later.');
      console.error('Error fetching blogs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, [currentPage, searchQuery, selectedTag]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchBlogs();
  };

  const handleTagClick = (tag) => {
    setSelectedTag(tag === selectedTag ? '' : tag);
    setCurrentPage(1);
  };

  if (loading) {
    return <div className="loading">Loading blog posts...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="blog-list">
      {blogs.map((blog) => (
        <div key={blog._id} className="blog-card">
          <img
            src={blog.thumbnail || '/default-blog-thumbnail.jpg'}
            alt={blog.title}
          />
          <div className="blog-card-content">
            <h3>{blog.title}</h3>
            <p className="blog-excerpt">{blog.excerpt}</p>
            <div className="blog-meta">
              <span>By {blog.author.name}</span>
              <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
              <span>{blog.comments.length} comments</span>
            </div>
            <Link to={`/blog/${blog._id}`} className="read-more">
              Read More
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
};

export default BlogList; 