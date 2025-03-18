const express = require('express');
const router = express.Router();
const authenticateJWT = require('../middleware/auth');
const {
  getForumPosts,
  getForumPost,
  createForumPost,
  updateForumPost,
  deleteForumPost,
  addComment,
  deleteComment,
  toggleCommentLike,
  acceptAnswer
} = require('../controllers/forumController');

// Debug middleware
router.use((req, res, next) => {
  console.log(`Forum Route: ${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  next();
});

// Public routes
router.get('/', getForumPosts);
router.get('/:id', getForumPost);

// Protected routes
router.use(authenticateJWT);

// Forum post routes
router.post('/', createForumPost);
router.put('/:id', updateForumPost);
router.delete('/:id', deleteForumPost);

// Comment routes
router.post('/:id/comments', addComment);
router.delete('/:id/comments/:commentId', deleteComment);
router.post('/:id/comments/:commentId/like', toggleCommentLike);

// Answer routes
router.post('/:id/comments/:commentId/accept', acceptAnswer);

module.exports = router; 