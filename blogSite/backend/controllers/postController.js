const Post = require('../models/Post'); // Make sure this points to your Post model

// Fetch all posts
const getPosts = async (req, res) => {
  try {
    const posts = await Post.findAll(); // Adjust based on your ORM/Database setup
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching posts', error });
  }
};

module.exports = {
  getPosts,
};
