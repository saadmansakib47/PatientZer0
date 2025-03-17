import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';
import { useAuth } from '../contexts/AuthContext';
import './BlogDetail.css';

const BlogDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comment, setComment] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [isAuthor, setIsAuthor] = useState(false);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const response = await axiosInstance.get(`/api/blogs/${id}`);
        setBlog(response.data);
        setIsLiked(response.data.likes.includes(user?._id));
        setIsAuthor(user?._id === response.data.author._id);
      } catch (err) {
        setError('Failed to fetch blog post. Please try again later.');
        console.error('Error fetching blog:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [id]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      const response = await axiosInstance.post(`/api/blogs/${id}/comments`, {
        content: comment,
      });
      setBlog((prev) => ({
        ...prev,
        comments: [...prev.comments, response.data],
      }));
      setComment('');
    } catch (err) {
      console.error('Error posting comment:', err);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await axiosInstance.delete(`/blogs/${id}/comments/${commentId}`);
      setBlog(prev => ({
        ...prev,
        comments: prev.comments.filter(c => c._id !== commentId)
      }));
    } catch (err) {
      console.error('Error deleting comment:', err);
    }
  };

  const handleToggleLike = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      const response = await axiosInstance.post(`/blogs/${id}/like`);
      setBlog(response.data);
      setIsLiked(response.data.likes.includes(user._id));
    } catch (err) {
      console.error('Error toggling like:', err);
    }
  };

  const handleDeleteBlog = async () => {
    if (!window.confirm('Are you sure you want to delete this blog post?')) {
      return;
    }

    try {
      await axiosInstance.delete(`/blogs/${id}`);
      navigate('/blog');
    } catch (err) {
      console.error('Error deleting blog:', err);
    }
  };

  if (loading) {
    return <div className="loading">Loading blog post...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!blog) {
    return <div className="error">Blog post not found</div>;
  }

  return (
    <div className="blog-detail">
      <div className="blog-header">
        <h1>{blog.title}</h1>
        <div className="blog-meta">
          <span>By {blog.author.name}</span>
          <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
        </div>
      </div>

      <img
        src={blog.thumbnail || '/default-blog-thumbnail.jpg'}
        alt={blog.title}
      />

      <div className="blog-content">{blog.content}</div>

      <div className="comments-section">
        <h3>Comments ({blog.comments.length})</h3>
        
        {user && (
          <form onSubmit={handleCommentSubmit} className="comment-form">
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Write a comment..."
              required
            />
            <button type="submit">Post Comment</button>
          </form>
        )}

        <div className="comments-list">
          {blog.comments.map((comment) => (
            <div key={comment._id} className="comment">
              <div className="comment-header">
                <span className="comment-author">{comment.author.name}</span>
                <span className="comment-date">
                  {new Date(comment.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="comment-content">{comment.content}</p>
              {(user?._id === comment.author._id || isAuthor) && (
                <button
                  className="delete-comment-button"
                  onClick={() => handleDeleteComment(comment._id)}
                >
                  Delete
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BlogDetail; 