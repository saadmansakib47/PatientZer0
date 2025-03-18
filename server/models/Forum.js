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
  },
  isAnswer: {
    type: Boolean,
    default: false
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
});

const forumSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['general', 'health', 'medical', 'lifestyle', 'nutrition', 'fitness', 'mental-health', 'other']
  },
  tags: [{
    type: String,
    trim: true
  }],
  comments: [commentSchema],
  views: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['open', 'closed', 'solved'],
    default: 'open'
  },
  acceptedAnswer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  }
}, {
  timestamps: true
});

// Add text index for search functionality
forumSchema.index({ title: 'text', content: 'text', tags: 'text' });

// Virtual for comment count
forumSchema.virtual('commentCount').get(function() {
  return this.comments.length;
});

// Method to increment views
forumSchema.methods.incrementViews = async function() {
  this.views += 1;
  return this.save();
};

// Method to add a comment
forumSchema.methods.addComment = async function(commentData) {
  this.comments.push(commentData);
  return this.save();
};

// Method to remove a comment
forumSchema.methods.removeComment = async function(commentId) {
  this.comments = this.comments.filter(comment => comment._id.toString() !== commentId);
  return this.save();
};

// Method to toggle like on a comment
forumSchema.methods.toggleCommentLike = async function(commentId, userId) {
  const comment = this.comments.id(commentId);
  if (!comment) return null;

  const index = comment.likes.indexOf(userId);
  if (index === -1) {
    comment.likes.push(userId);
  } else {
    comment.likes.splice(index, 1);
  }
  return this.save();
};

// Method to accept an answer
forumSchema.methods.acceptAnswer = async function(commentId) {
  const comment = this.comments.id(commentId);
  if (!comment || !comment.isAnswer) return null;

  this.status = 'solved';
  this.acceptedAnswer = commentId;
  return this.save();
};

const Forum = mongoose.model('Forum', forumSchema);

module.exports = Forum; 