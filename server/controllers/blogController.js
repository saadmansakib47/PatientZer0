const Blog = require('../models/Blog');
const User = require('../models/User');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads/blog-thumbnails/'));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5000000 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
    }
  }
});

// Get all blogs with pagination and search
const getBlogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const tag = req.query.tag || '';

    const query = {};
    if (search) {
      query.$text = { $search: search };
    }
    if (tag) {
      query.tags = tag;
    }

    const blogs = await Blog.find(query)
      .populate('author', 'name profilePhoto')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Blog.countDocuments(query);

    res.json({
      blogs,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    console.error('Error fetching blogs:', error);
    res.status(500).json({ message: 'Error fetching blogs' });
  }
};

// Get a single blog by ID
const getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id)
      .populate('author', 'name profilePhoto')
      .populate('comments.author', 'name profilePhoto');

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    // Increment view count
    await blog.incrementViews();

    res.json(blog);
  } catch (error) {
    console.error('Error fetching blog:', error);
    res.status(500).json({ message: 'Error fetching blog' });
  }
};

// Create a new blog
const createBlog = async (req, res) => {
  try {
    const { title, content, excerpt, tags } = req.body;
    const thumbnail = req.file ? `/uploads/blog-thumbnails/${req.file.filename}` : null;

    const blog = new Blog({
      title,
      content,
      excerpt,
      thumbnail,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      author: req.user._id
    });

    await blog.save();
    await blog.populate('author', 'name profilePhoto');

    res.status(201).json(blog);
  } catch (error) {
    console.error('Error creating blog:', error);
    res.status(500).json({ message: 'Error creating blog' });
  }
};

// Update a blog
const updateBlog = async (req, res) => {
  try {
    const { title, content, excerpt, tags } = req.body;
    const thumbnail = req.file ? `/uploads/blog-thumbnails/${req.file.filename}` : req.body.thumbnail;

    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    // Check if user is the author
    if (blog.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this blog' });
    }

    blog.title = title || blog.title;
    blog.content = content || blog.content;
    blog.excerpt = excerpt || blog.excerpt;
    blog.thumbnail = thumbnail || blog.thumbnail;
    blog.tags = tags ? tags.split(',').map(tag => tag.trim()) : blog.tags;

    await blog.save();
    await blog.populate('author', 'name profilePhoto');

    res.json(blog);
  } catch (error) {
    console.error('Error updating blog:', error);
    res.status(500).json({ message: 'Error updating blog' });
  }
};

// Delete a blog
const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    // Check if user is the author
    if (blog.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this blog' });
    }

    await blog.remove();
    res.json({ message: 'Blog deleted successfully' });
  } catch (error) {
    console.error('Error deleting blog:', error);
    res.status(500).json({ message: 'Error deleting blog' });
  }
};

// Add a comment to a blog
const addComment = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    const comment = {
      content: req.body.content,
      author: req.user._id
    };

    await blog.addComment(comment);
    await blog.populate('comments.author', 'name profilePhoto');

    res.status(201).json(blog);
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ message: 'Error adding comment' });
  }
};

// Delete a comment
const deleteComment = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    const comment = blog.comments.id(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check if user is the comment author or blog author
    if (comment.author.toString() !== req.user._id.toString() && 
        blog.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }

    await blog.removeComment(req.params.commentId);
    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ message: 'Error deleting comment' });
  }
};

// Toggle like on a blog
const toggleLike = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    await blog.toggleLike(req.user._id);
    res.json(blog);
  } catch (error) {
    console.error('Error toggling like:', error);
    res.status(500).json({ message: 'Error toggling like' });
  }
};

module.exports = {
  upload,
  getBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
  addComment,
  deleteComment,
  toggleLike
}; 