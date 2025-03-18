import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../utils/axiosInstance';
import './CommentSection.css';

const CommentSection = ({ blogId, comments = [], onCommentAdded }) => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [newComment, setNewComment] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      await axiosInstance.post(`/blogs/${blogId}/comments`, {
        content: newComment
      });
      setNewComment('');
      setError('');
      if (onCommentAdded) {
        onCommentAdded();
      }
    } catch (err) {
      setError('Failed to post comment');
      console.error('Error posting comment:', err);
    }
  };

  const handleDelete = async (commentId) => {
    if (!isAuthenticated) return;

    if (window.confirm('Are you sure you want to delete this comment?')) {
      try {
        await axiosInstance.delete(`/blogs/${blogId}/comments/${commentId}`);
        if (onCommentAdded) {
          onCommentAdded();
        }
      } catch (err) {
        setError('Failed to delete comment');
        console.error('Error deleting comment:', err);
      }
    }
  };

  return (
    <div className="comments-section">
      <h2>Comments ({comments.length})</h2>

      {error && <div className="comment-error">{error}</div>}

      {isAuthenticated ? (
        <form onSubmit={handleSubmit} className="comment-form">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write your comment..."
            required
          />
          <button type="submit">Post Comment</button>
        </form>
      ) : (
        <p className="login-prompt">
          Please <button onClick={() => navigate('/login')}>log in</button> to comment
        </p>
      )}

      <div className="comments-list">
        {comments.map(comment => (
          <div key={comment._id} className="comment">
            <div className="comment-header">
              <span className="comment-author">{comment.author?.name || 'Anonymous'}</span>
              <span className="comment-date">
                {new Date(comment.createdAt).toLocaleDateString()}
              </span>
            </div>
            <p className="comment-content">{comment.content}</p>
            {isAuthenticated && (user._id === comment.author || user._id === comment.author?._id) && (
              <button
                onClick={() => handleDelete(comment._id)}
                className="delete-comment"
              >
                Delete
              </button>
            )}
          </div>
        ))}
        {comments.length === 0 && (
          <p className="no-comments">No comments yet. Be the first to comment!</p>
        )}
      </div>
    </div>
  );
};

export default CommentSection; 