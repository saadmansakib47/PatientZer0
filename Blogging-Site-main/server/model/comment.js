import mongoose from "mongoose";

const CommentSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  postId: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  comments: {
    type: String,
    required: true,
  },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "comment",
    default: null,
  },
  upvotes: [
    {
      type: String, // Store usernames of users who upvoted
      required: true,
    },
  ],
  downvotes: [
    {
      type: String, // Store usernames of users who downvoted
      required: true,
    },
  ],
  score: {
    type: Number,
    default: 0,
  },
});

const comment = mongoose.model("comment", CommentSchema);

export default comment;
