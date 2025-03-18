// src/pages/Community.js
import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { forumService } from "../services/forumService";
import "./Community.css";

const Community = () => {
  const { isAuthenticated, user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newPost, setNewPost] = useState({ title: "", content: "", category: "general" });
  const [showNewPostForm, setShowNewPostForm] = useState(false);
  const [commentingPost, setCommentingPost] = useState(null);
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await forumService.getForumPosts();
      setPosts(response.posts);
    } catch (err) {
      setError("Failed to fetch posts");
      console.error("Error fetching posts:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setError("Please log in to create a post");
      return;
    }

    try {
      const post = await forumService.createForumPost(newPost);
      setPosts([post, ...posts]);
      setNewPost({ title: "", content: "", category: "general" });
      setShowNewPostForm(false);
    } catch (err) {
      setError("Failed to create post");
      console.error("Error creating post:", err);
    }
  };

  const handleCommentSubmit = async (postId) => {
    if (!isAuthenticated) {
      setError("Please log in to comment");
      return;
    }

    try {
      const comment = await forumService.addComment(postId, { content: newComment });
      setPosts(posts.map(post => 
        post._id === postId 
          ? { ...post, comments: [...post.comments, comment] }
          : post
      ));
      setNewComment("");
      setCommentingPost(null);
    } catch (err) {
      setError("Failed to add comment");
      console.error("Error adding comment:", err);
    }
  };

  const handleLike = async (postId, commentId) => {
    if (!isAuthenticated) {
      setError("Please log in to like comments");
      return;
    }

    try {
      const updatedPost = await forumService.toggleCommentLike(postId, commentId);
      setPosts(posts.map(post => 
        post._id === postId ? updatedPost : post
      ));
    } catch (err) {
      setError("Failed to like comment");
      console.error("Error liking comment:", err);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!isAuthenticated) {
      setError("Please log in to delete posts");
      return;
    }

    if (window.confirm("Are you sure you want to delete this post?")) {
      try {
        await forumService.deleteForumPost(postId);
        setPosts(posts.filter(post => post._id !== postId));
      } catch (err) {
        setError("Failed to delete post");
        console.error("Error deleting post:", err);
      }
    }
  };

  if (loading) {
    return <div className="loading">Loading posts...</div>;
  }

  return (
    <div className="community">
      <h1 className="community-title">Community Forum</h1>
      <p className="community-description">
        Connect, share, and support each other. Here, you can ask questions,
        share experiences, and discuss health-related topics with others in the
        community.
      </p>

      {error && <div className="error-message">{error}</div>}

      {isAuthenticated && (
        <div className="create-post">
          {!showNewPostForm ? (
            <button 
              className="new-post-button"
              onClick={() => setShowNewPostForm(true)}
            >
              Create New Post
            </button>
          ) : (
            <form onSubmit={handlePostSubmit}>
              <input
                type="text"
                placeholder="Title"
                value={newPost.title}
                onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                required
              />
              <textarea
                placeholder="What's on your mind?"
                value={newPost.content}
                onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                required
              />
              <select
                value={newPost.category}
                onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
              >
                <option value="general">General</option>
                <option value="health">Health</option>
                <option value="wellness">Wellness</option>
                <option value="support">Support</option>
              </select>
              <div className="form-actions">
                <button type="button" onClick={() => setShowNewPostForm(false)}>
                  Cancel
                </button>
                <button type="submit">Post</button>
              </div>
            </form>
          )}
        </div>
      )}

      <div className="posts-feed">
        {posts.map((post) => (
          <div key={post._id} className="post-card">
            <div className="post-header">
              <h3>{post.title}</h3>
              <span className="post-category">{post.category}</span>
            </div>
            <p className="post-content">{post.content}</p>
            <div className="post-meta">
              <span className="post-author">
                Posted by {post.author?.name || "Anonymous"}
              </span>
              <span className="post-date">
                {new Date(post.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div className="post-actions">
              <button
                onClick={() => setCommentingPost(commentingPost === post._id ? null : post._id)}
                className="comment-button"
              >
                💬 Comment
              </button>
              {isAuthenticated && user?._id === post.author?._id && (
                <button
                  onClick={() => handleDeletePost(post._id)}
                  className="delete-button"
                >
                  Delete
                </button>
              )}
            </div>

            {commentingPost === post._id && (
              <div className="comment-form">
                <textarea
                  placeholder="Write your comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
                <button onClick={() => handleCommentSubmit(post._id)}>
                  Submit Comment
                </button>
              </div>
            )}

            <div className="comments-section">
              {post.comments?.map((comment) => (
                <div key={comment._id} className="comment">
                  <div className="comment-header">
                    <span className="comment-author">
                      {comment.author?.name || "Anonymous"}
                    </span>
                    <span className="comment-date">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="comment-content">{comment.content}</p>
                  <div className="comment-actions">
                    <button
                      onClick={() => handleLike(post._id, comment._id)}
                      className={`like-button ${comment.likes?.includes(user?._id) ? "liked" : ""}`}
                    >
                      👍 {comment.likes?.length || 0}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Community;
