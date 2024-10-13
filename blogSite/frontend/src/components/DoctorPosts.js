import React, { useState, useEffect } from 'react';
import axios from 'axios';  // Import Axios for API calls

function DoctorPosts() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    // Fetch posts from the backend
    const fetchPosts = async () => {
      try {
        const response = await axios.get('http://localhost:5000/posts');  // Ensure correct backend URL
        setPosts(response.data);  // Set the fetched posts in state
      } catch (error) {
        console.error('Error fetching posts:', error);  // Log any errors
      }
    };

    fetchPosts();  // Call the fetch function
  }, []);  // Empty array to run only once on component mount

  return (
    <div>
      <h1>Doctor Posts</h1>
      {posts.length > 0 ? (
        <ul>
          {posts.map(post => (
            <li key={post.id}>
              <h2>{post.title}</h2>
              <p>{post.content}</p>
              <small>Author ID: {post.authorId}</small>
            </li>
          ))}
        </ul>
      ) : (
        <p>No posts available</p>  // Message if no posts
      )}
    </div>
  );
}

export default DoctorPosts;
