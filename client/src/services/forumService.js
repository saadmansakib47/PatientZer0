import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const forumService = {
  // Get all forum posts with pagination and search
  getForumPosts: async (page = 1, limit = 10, search = '', category = '', status = '') => {
    const response = await api.get('/forum', {
      params: { page, limit, search, category, status }
    });
    return response.data;
  },

  // Get a single forum post
  getForumPost: async (id) => {
    const response = await api.get(`/forum/${id}`);
    return response.data;
  },

  // Create a new forum post
  createForumPost: async (postData) => {
    const response = await api.post('/forum', postData);
    return response.data;
  },

  // Update a forum post
  updateForumPost: async (id, postData) => {
    const response = await api.put(`/forum/${id}`, postData);
    return response.data;
  },

  // Delete a forum post
  deleteForumPost: async (id) => {
    const response = await api.delete(`/forum/${id}`);
    return response.data;
  },

  // Add a comment to a forum post
  addComment: async (postId, commentData) => {
    const response = await api.post(`/forum/${postId}/comments`, commentData);
    return response.data;
  },

  // Delete a comment
  deleteComment: async (postId, commentId) => {
    const response = await api.delete(`/forum/${postId}/comments/${commentId}`);
    return response.data;
  },

  // Toggle like on a comment
  toggleCommentLike: async (postId, commentId) => {
    const response = await api.post(`/forum/${postId}/comments/${commentId}/like`);
    return response.data;
  },

  // Accept an answer
  acceptAnswer: async (postId, commentId) => {
    const response = await api.post(`/forum/${postId}/comments/${commentId}/accept`);
    return response.data;
  }
}; 