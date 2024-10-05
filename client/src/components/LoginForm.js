import React, { useState } from 'react';
import axios from 'axios';
import './form.css'; // Import the CSS file

const LoginForm = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('/api/auth/login', formData);
            console.log(res.data);  // will receive the token here
        } catch (error) {
            console.error(error.response.data);
        }
    };

    return (
        <div className="form-container">
            <h1 className="form-title">PatientZer0</h1> {/* Title added here */}
            <p className="form-subtitle">Your health ally from experience</p> {/* Subtitle added here */}
            <form onSubmit={handleSubmit}>
                <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
                <input type="password" name="password" placeholder="Password" onChange={handleChange} required />
                <button type="submit" className="btn">Log In</button> {/* Class added for styling */}
                <p>Don't have an account? <a href="/signup">Sign Up</a></p>
            </form>
        </div>
    );
};

export default LoginForm;
