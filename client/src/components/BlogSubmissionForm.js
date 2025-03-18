import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../utils/axiosInstance';
import './BlogSubmissionForm.css';

const BlogSubmissionForm = ({ blogId = null }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    tags: '',
  });
  const [thumbnail, setThumbnail] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (blogId) {
      fetchBlogData();
    }
  }, [blogId, isAuthenticated, navigate]);

  const fetchBlogData = async () => {
    try {
      const response = await axiosInstance.get(`/blogs/${blogId}`);
      const blog = response.data;
      setFormData({
        title: blog.title,
        content: blog.content,
        excerpt: blog.excerpt || '',
        tags: blog.tags?.join(', ') || '',
      });
      if (blog.thumbnail) {
        setPreviewUrl(blog.thumbnail);
      }
    } catch (err) {
      setError('Failed to fetch blog data');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setThumbnail(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('content', formData.content);
      formDataToSend.append('excerpt', formData.excerpt);
      formDataToSend.append('tags', formData.tags.split(',').map(tag => tag.trim()));
      if (thumbnail) {
        formDataToSend.append('thumbnail', thumbnail);
      }

      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      };

      let response;
      if (blogId) {
        response = await axiosInstance.put(`/blogs/${blogId}`, formDataToSend, config);
      } else {
        response = await axiosInstance.post('/blogs', formDataToSend, config);
      }

      if (response.data) {
        navigate('/blog');
      }
    } catch (err) {
      console.error('Error saving blog:', err);
      setError(err.response?.data?.message || 'Failed to save blog post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="blog-form-container">
      <h2>{blogId ? 'Edit Blog Post' : 'Create New Blog Post'}</h2>
      {error && <div className="blog-form-error">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="excerpt">Excerpt</label>
          <textarea
            id="excerpt"
            name="excerpt"
            value={formData.excerpt}
            onChange={handleInputChange}
            rows="2"
          />
        </div>

        <div className="form-group">
          <label htmlFor="content">Content</label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleInputChange}
            rows="10"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="tags">Tags (comma-separated)</label>
          <input
            type="text"
            id="tags"
            name="tags"
            value={formData.tags}
            onChange={handleInputChange}
            placeholder="e.g., health, wellness, tips"
          />
        </div>

        <div className="form-group">
          <label htmlFor="thumbnail">
            Thumbnail Image
            <span className="optional-label">(optional)</span>
          </label>
          <input
            type="file"
            id="thumbnail"
            accept="image/*"
            onChange={handleThumbnailChange}
          />
          {previewUrl && (
            <div className="thumbnail-preview">
              <img src={previewUrl} alt="Thumbnail preview" />
            </div>
          )}
        </div>

        <div className="form-actions">
          <button type="button" onClick={() => navigate('/blog')} className="cancel-btn">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? 'Saving...' : (blogId ? 'Update Post' : 'Create Post')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BlogSubmissionForm; 