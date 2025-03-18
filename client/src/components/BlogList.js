import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';
import './BlogList.css';

const BlogList = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const response = await axiosInstance.get('/blogs');
      console.log('Blog response:', response.data);
      setBlogs(Array.isArray(response.data) ? response.data : response.data.blogs || []);
    } catch (err) {
      setError('Failed to fetch blogs');
      console.error('Error fetching blogs:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="blog-loading">Loading blogs...</div>;
  }

  if (error) {
    return <div className="blog-error">{error}</div>;
  }

  return (
    <div className="blog-list-container">
      <div className="blog-list-header">
        <h1>Health & Wellness Blog</h1>
        <Link to="/blog/new" className="create-blog-btn">
          Create New Post
        </Link>
      </div>

      <div className="blog-grid">
        {blogs.map(blog => (
          <Link to={`/blog/${blog._id}`} key={blog._id} className="blog-card">
            {blog.thumbnail && (
              <div className="blog-thumbnail">
                <img src={blog.thumbnail} alt={blog.title} />
              </div>
            )}
            <div className="blog-card-content">
              <h2>{blog.title}</h2>
              <p className="blog-excerpt">{blog.excerpt || blog.content.substring(0, 150)}...</p>
              <div className="blog-meta">
                <span className="blog-date">
                  {new Date(blog.createdAt).toLocaleDateString()}
                </span>
                {blog.tags && blog.tags.length > 0 && (
                  <div className="blog-tags">
                    {blog.tags.map((tag, index) => (
                      <span key={index} className="tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {blogs.length === 0 && (
        <div className="no-blogs">
          <p>No blog posts yet. Be the first to create one!</p>
          <Link to="/blog/new" className="create-blog-btn">
            Create New Post
          </Link>
        </div>
      )}
    </div>
  );
};

export default BlogList; 