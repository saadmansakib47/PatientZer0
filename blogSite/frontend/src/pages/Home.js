import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Post from '../components/Post';

const Home = () => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    axios.get('/api/posts').then((response) => setPosts(response.data));
  }, []);

  return (
    <div>
      <h1>Doctor Posts</h1>
      {posts.map((post) => (
        <Post key={post.id} post={post} />
      ))}
    </div>
  );
};

export default Home;
