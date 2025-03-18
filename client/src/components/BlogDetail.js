import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../utils/axiosInstance';
import CommentSection from './CommentSection';
import './BlogDetail.css';

const BlogDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBlog();
  }, [id]);

  const fetchBlog = async () => {
    try {
      const response = await axiosInstance.get(`/blogs/${id}`);
      setBlog(response.data);
    } catch (err) {
      setError('Failed to fetch blog post');
      console.error('Error fetching blog:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!isAuthenticated || !user || user._id !== blog.author) {
      return;
    }

    if (window.confirm('Are you sure you want to delete this blog post?')) {
      try {
        await axiosInstance.delete(`/blogs/${id}`);
        navigate('/blog');
      } catch (err) {
        setError('Failed to delete blog post');
        console.error('Error deleting blog:', err);
      }
    }
  };

  if (loading) {
    return <div className="blog-detail-loading">Loading blog post...</div>;
  }

  if (error) {
    return <div className="blog-detail-error">{error}</div>;
  }

  if (!blog) {
    return <div className="blog-detail-error">Blog post not found</div>;
  }

  return (
    <div className="blog-detail-container">
      <div className="blog-detail-header">
        <Link to="/blog" className="back-to-blogs">
          ← Back to Blogs
        </Link>
        {isAuthenticated && user && user._id === blog.author && (
          <div className="blog-actions">
            <Link to={`/blog/edit/${id}`} className="edit-blog-btn">
              Edit Post
            </Link>
            <button onClick={handleDelete} className="delete-blog-btn">
              Delete Post
            </button>
          </div>
        )}
      </div>

      <article className="blog-detail-content">
        <h1>{blog.title}</h1>
        
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

        {blog.thumbnail && (
          <div className="blog-detail-thumbnail">
            <img src={blog.thumbnail} alt={blog.title} />
          </div>
        )}

        <div className="blog-content">
          {blog.content.split('\n').map((paragraph, index) => (
            paragraph && <p key={index}>{paragraph}</p>
          ))}
        </div>
      </article>

      <CommentSection blogId={id} comments={blog.comments} onCommentAdded={fetchBlog} />
    </div>
  );
};

export default BlogDetail; 