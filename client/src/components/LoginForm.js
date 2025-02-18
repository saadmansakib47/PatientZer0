// src/components/LoginForm.js
import React, { useState } from 'react';
import axiosInstance from '../utils/axiosInstance'; // Import the axios instance
import { useAuth } from '../context/AuthContext';
import './form.css';

const LoginForm = () => {
    const { login } = useAuth();
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
            const res = await axiosInstance.post('/auth/login', formData);
            console.log('Logged in user:', res.data.user);
            localStorage.setItem('token', res.data.token);
            // Store role for redirect logic
            login({ name: res.data.user.name, role: res.data.user.role });
        } catch (error) {
            console.error(error.response ? error.response.data : error.message);
        }
    };


    return (
        <div className="form-container">
            <h1 className="form-title">Login</h1>
            <form onSubmit={handleSubmit}>
                <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
                <input type="password" name="password" placeholder="Password" onChange={handleChange} required />
                <button type="submit" className="btn">Login</button>
            </form>
        </div>
    );
};

export default LoginForm;
