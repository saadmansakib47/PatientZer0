const Comment = require('../models/Comment');

exports.createComment = async (req, res) => {
  const { content, postId } = req.body;
  const comment = await Comment.create({ content, postId, userId: req.userId });
  res.send(comment);
};

exports.getCommentsByPost = async (req, res) => {
  const comments = await Comment.findAll({ where: { postId: req.params.id } });
  res.send(comments);
};
