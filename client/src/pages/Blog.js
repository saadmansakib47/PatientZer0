import React, { useState } from 'react';
import './Blog.css';
import BlogCard from '../components/BlogCard';
import BlogEditor from '../components/BlogEditor';
import CommentBox from '../components/CommentBox';

const Blog = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredBlogs, setFilteredBlogs] = useState([]);
    const [blogs, setBlogs] = useState([
        {
            title: "Understanding Your Health Data",
            excerpt: "Learn how to interpret your medical reports and understand the information in your health data.",
            date: "October 12, 2024",
            author: "Dr. Sarah Lee",
            imgSrc: "https://via.placeholder.com/600x300",
            topics: ["Health Data", "Reports", "Understanding"],
        },
        {
            title: "Tips for Healthy Living",
            excerpt: "Explore tips on maintaining a healthy lifestyle, from diet to exercise to mental well-being.",
            date: "September 29, 2024",
            author: "Dr. John Smith",
            imgSrc: "https://via.placeholder.com/600x300",
            topics: ["Healthy Living", "Lifestyle", "Diet"],
        },
        {
            title: "What to Do After a Medical Test",
            excerpt: "A step-by-step guide on what to do after undergoing a medical test and how to interpret the results.",
            date: "September 15, 2024",
            author: "Dr. Emily Clark",
            imgSrc: "https://via.placeholder.com/600x300",
            topics: ["Medical Test", "Post-Test", "Interpretation"],
        },
    ]);

    const [comments, setComments] = useState([]);

    const handleSearch = (event) => {
        const query = event.target.value.toLowerCase();
        setSearchQuery(query);
        const filtered = blogs.filter(post =>
            post.topics.some(topic => topic.toLowerCase().includes(query))
        );
        setFilteredBlogs(filtered);
    };

    const handleSaveBlog = (newBlog) => {
        setBlogs([newBlog, ...blogs]);
        setFilteredBlogs([]);
        setSearchQuery('');
    };

    const handleAddComment = (newComment) => {
        setComments([...comments, newComment]);
    };

    return (
        <div className="blog-container">
            <h1 className="blog-title">Medical Blog</h1>

            {/* Blog Editor Section */}
            <div className="blog-editor-section">
                <BlogEditor onSave={handleSaveBlog} />
            </div>

            {/* Search Section */}
            <div className="search-container">
                <input
                    type="text"
                    placeholder="Search blog topics..."
                    value={searchQuery}
                    onChange={handleSearch}
                    className="search-input"
                />
                <button className="search-button">Search</button>
            </div>

            {/* Blog Posts Section */}
            <div className="blog-posts">
                {(filteredBlogs.length > 0 ? filteredBlogs : blogs).map((post, index) => (
                    <BlogCard
                        key={index}
                        title={post.title}
                        excerpt={post.excerpt}
                        date={post.date}
                        author={post.author}
                        imgSrc={post.imgSrc}
                    />
                ))}
            </div>

            {/* Comments Section */}
            <div className="comments-section">
                <h3 className="comments-title">Comments</h3>
                <CommentBox onAddComment={handleAddComment} />
                <ul className="comment-list">
                    {comments.map((comment, index) => (
                        <li key={index} className="comment-item">
                            {comment}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default Blog;
