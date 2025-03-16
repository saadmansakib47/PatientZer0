// src/pages/Community.js
import React, { useState } from "react";
import "./Community.css";

const Community = () => {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState("");

  const handlePostSubmit = (e) => {
    e.preventDefault();
    if (newPost) {
      setPosts([
        { id: Date.now(), content: newPost, likes: 0, comments: [] },
        ...posts,
      ]);
      setNewPost("");
    }
  };

  const handleLike = (id) => {
    setPosts(
      posts.map((post) =>
        post.id === id ? { ...post, likes: post.likes + 1 } : post
      )
    );
  };

  return (
    <div className="community">
      <h1 className="community-title">Community Forum</h1>
      <p className="community-description">
        Connect, share, and support each other. Here, you can ask questions,
        share experiences, and discuss health-related topics with others in the
        community.
      </p>

      <div className="create-post">
        <form onSubmit={handlePostSubmit}>
          <textarea
            placeholder="What's on your mind?"
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            required
          />
          <button type="submit" className="post-button">
            Post
          </button>
        </form>
      </div>

      <div className="post-feed">
        {posts.map((post) => (
          <div key={post.id} className="post-card">
            <p className="post-content">{post.content}</p>
            <div className="post-actions">
              <button
                onClick={() => handleLike(post.id)}
                className="like-button"
              >
                👍 {post.likes}
              </button>
              <button className="comment-button">💬 Comment</button>
            </div>
            {/* Placeholder for future comment section */}
            <div className="comments-section">
              {post.comments.map((comment, idx) => (
                <p key={idx} className="comment">
                  {comment}
                </p>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Community;
