import React, { useState } from 'react';
import './CommentBox.css';

const CommentBox = ({ onAddComment }) => {
    const [comment, setComment] = useState('');

    const handleAddComment = () => {
        if (comment.trim()) {
            onAddComment(comment.trim());
            setComment('');
        } else {
            alert('Comment cannot be empty!');
        }
    };

    return (
        <div className="comment-box">
      <textarea
          placeholder="Write your comment..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="comment-input"
      />
            <button onClick={handleAddComment} className="comment-button">Add Comment</button>
        </div>
    );
};

export default CommentBox;
