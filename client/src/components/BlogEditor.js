import React, { useState } from 'react';
import './BlogEditor.css';

const BlogEditor = ({ onSave }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [author, setAuthor] = useState('');
    const [topics, setTopics] = useState('');
    const [imgSrc, setImgSrc] = useState('');

    const handleSave = () => {
        if (title && content && author && topics && imgSrc) {
            onSave({
                title,
                content,
                author,
                topics: topics.split(',').map(topic => topic.trim()),
                imgSrc,
                date: new Date().toLocaleDateString(),
            });
            setTitle('');
            setContent('');
            setAuthor('');
            setTopics('');
            setImgSrc('');
        } else {
            alert('Please fill all fields');
        }
    };

    return (
        <div className="blog-editor">
            <h2>Create/Edit Blog</h2>
            <input
                type="text"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="editor-input"
            />
            <textarea
                placeholder="Content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="editor-textarea"
            />
            <input
                type="text"
                placeholder="Author"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="editor-input"
            />
            <input
                type="text"
                placeholder="Topics (comma separated)"
                value={topics}
                onChange={(e) => setTopics(e.target.value)}
                className="editor-input"
            />
            <input
                type="text"
                placeholder="Image URL"
                value={imgSrc}
                onChange={(e) => setImgSrc(e.target.value)}
                className="editor-input"
            />
            <button onClick={handleSave} className="editor-save-button">Save</button>
        </div>
    );
};

export default BlogEditor;
