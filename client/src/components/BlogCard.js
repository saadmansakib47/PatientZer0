import React from 'react';
import './BlogCard.css';

const BlogCard = ({ title, excerpt, date, author, imgSrc }) => {
    return (
        <div className="blog-card">
            <img src={imgSrc} alt={title} className="blog-card-img" />
            <div className="blog-card-content">
                <h2 className="blog-card-title">{title}</h2>
                <p className="blog-card-excerpt">{excerpt}</p>
                <div className="blog-card-meta">
                    <span className="blog-card-date">{date}</span>
                    <span className="blog-card-author">{`by ${author}`}</span>
                </div>
            </div>
        </div>
    );
};

export default BlogCard;
