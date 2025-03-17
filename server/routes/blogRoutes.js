const express = require('express');
const router = express.Router();
const authenticateJWT = require('../middleware/auth');
const {
  upload,
  getBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
  addComment,
  deleteComment,
  toggleLike
} = require('../controllers/blogController');

// Public routes
router.get('/', getBlogs);
router.get('/:id', getBlogById);

// Protected routes
router.post('/', authenticateJWT, upload.single('thumbnail'), createBlog);
router.put('/:id', authenticateJWT, upload.single('thumbnail'), updateBlog);
router.delete('/:id', authenticateJWT, deleteBlog);

// Comment routes
router.post('/:id/comments', authenticateJWT, addComment);
router.delete('/:id/comments/:commentId', authenticateJWT, deleteComment);

// Like route
router.post('/:id/like', authenticateJWT, toggleLike);

module.exports = router; 