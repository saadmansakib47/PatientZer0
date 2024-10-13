const express = require('express');
const { getPosts } = require('../controllers/postController'); // Make sure this points to the correct controller
const router = express.Router();

// GET all posts
router.get('/', getPosts);

module.exports = router;
