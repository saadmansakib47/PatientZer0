const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
    trim: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  excerpt: {
    type: String,
    required: true,
    trim: true
  },
  thumbnail: {
    type: String,
    default: null
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  comments: [commentSchema],
  tags: [{
    type: String,
    trim: true
  }],
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  views: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Add text index for search functionality
blogSchema.index({ title: 'text', content: 'text', tags: 'text' });

// Virtual for comment count
blogSchema.virtual('commentCount').get(function() {
  return this.comments.length;
});

// Method to increment views
blogSchema.methods.incrementViews = async function() {
  this.views += 1;
  return this.save();
};

// Method to add a comment
blogSchema.methods.addComment = async function(commentData) {
  this.comments.push(commentData);
  return this.save();
};

// Method to remove a comment
blogSchema.methods.removeComment = async function(commentId) {
  this.comments = this.comments.filter(comment => comment._id.toString() !== commentId);
  return this.save();
};

// Method to toggle like
blogSchema.methods.toggleLike = async function(userId) {
  const index = this.likes.indexOf(userId);
  if (index === -1) {
    this.likes.push(userId);
  } else {
    this.likes.splice(index, 1);
  }
  return this.save();
};

const Blog = mongoose.model('Blog', blogSchema);

module.exports = Blog; 