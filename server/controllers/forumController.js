const Forum = require('../models/Forum');

// Get all forum posts with pagination and search
exports.getForumPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const category = req.query.category || '';
    const status = req.query.status || '';

    const query = {};
    if (search) {
      query.$text = { $search: search };
    }
    if (category) {
      query.category = category;
    }
    if (status) {
      query.status = status;
    }

    const posts = await Forum.find(query)
      .populate('author', 'name profilePhoto')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Forum.countDocuments(query);

    res.json({
      posts,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    console.error('Error fetching forum posts:', error);
    res.status(500).json({ message: 'Error fetching forum posts' });
  }
};

// Get a single forum post
exports.getForumPost = async (req, res) => {
  try {
    const post = await Forum.findById(req.params.id)
      .populate('author', 'name profilePhoto')
      .populate('comments.author', 'name profilePhoto')
      .populate('acceptedAnswer');

    if (!post) {
      return res.status(404).json({ message: 'Forum post not found' });
    }

    // Increment view count
    await post.incrementViews();

    res.json(post);
  } catch (error) {
    console.error('Error fetching forum post:', error);
    res.status(500).json({ message: 'Error fetching forum post' });
  }
};

// Create a new forum post
exports.createForumPost = async (req, res) => {
  try {
    const { title, content, category, tags } = req.body;
    const post = new Forum({
      title,
      content,
      category,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      author: req.user._id
    });

    await post.save();
    await post.populate('author', 'name profilePhoto');

    res.status(201).json(post);
  } catch (error) {
    console.error('Error creating forum post:', error);
    res.status(500).json({ message: 'Error creating forum post' });
  }
};

// Update a forum post
exports.updateForumPost = async (req, res) => {
  try {
    const { title, content, category, tags, status } = req.body;
    const post = await Forum.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Forum post not found' });
    }

    // Check if user is the author
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this post' });
    }

    post.title = title || post.title;
    post.content = content || post.content;
    post.category = category || post.category;
    post.tags = tags ? tags.split(',').map(tag => tag.trim()) : post.tags;
    if (status) post.status = status;

    await post.save();
    await post.populate('author', 'name profilePhoto');

    res.json(post);
  } catch (error) {
    console.error('Error updating forum post:', error);
    res.status(500).json({ message: 'Error updating forum post' });
  }
};

// Delete a forum post
exports.deleteForumPost = async (req, res) => {
  try {
    const post = await Forum.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Forum post not found' });
    }

    // Check if user is the author
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }

    await post.remove();
    res.json({ message: 'Forum post deleted successfully' });
  } catch (error) {
    console.error('Error deleting forum post:', error);
    res.status(500).json({ message: 'Error deleting forum post' });
  }
};

// Add a comment to a forum post
exports.addComment = async (req, res) => {
  try {
    const { content, isAnswer } = req.body;
    const post = await Forum.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Forum post not found' });
    }

    const comment = {
      content,
      author: req.user._id,
      isAnswer: isAnswer || false
    };

    await post.addComment(comment);
    await post.populate('comments.author', 'name profilePhoto');

    res.status(201).json(post);
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ message: 'Error adding comment' });
  }
};

// Delete a comment
exports.deleteComment = async (req, res) => {
  try {
    const post = await Forum.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Forum post not found' });
    }

    const comment = post.comments.id(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check if user is the comment author or post author
    if (comment.author.toString() !== req.user._id.toString() && 
        post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }

    await post.removeComment(req.params.commentId);
    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ message: 'Error deleting comment' });
  }
};

// Toggle like on a comment
exports.toggleCommentLike = async (req, res) => {
  try {
    const post = await Forum.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Forum post not found' });
    }

    await post.toggleCommentLike(req.params.commentId, req.user._id);
    res.json(post);
  } catch (error) {
    console.error('Error toggling comment like:', error);
    res.status(500).json({ message: 'Error toggling comment like' });
  }
};

// Accept an answer
exports.acceptAnswer = async (req, res) => {
  try {
    const post = await Forum.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Forum post not found' });
    }

    // Check if user is the post author
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to accept answers' });
    }

    await post.acceptAnswer(req.params.commentId);
    res.json(post);
  } catch (error) {
    console.error('Error accepting answer:', error);
    res.status(500).json({ message: 'Error accepting answer' });
  }
}; 