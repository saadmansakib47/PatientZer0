import React, { useEffect, useState } from 'react';
import axios from 'axios';

const PostDetails = ({ match }) => {
  const [post, setPost] = useState({});
  const [comments, setComments] = useState([]);

  useEffect(() => {
    axios.get(`/api/posts/${match.params.id}`).then((response) => setPost(response.data));
    axios.get(`/api/comments/${match.params.id}`).then((response) => setComments(response.data));
  }, [match.params.id]);

  return (
    <div>
      <h1>{post.title}</h1>
      <p>{post.content}</p>

      <h3>Comments</h3>
      {comments.map((comment) => (
        <div key={comment.id}>{comment.content}</div>
      ))}
    </div>
  );
};

export default PostDetails;
