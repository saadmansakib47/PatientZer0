import React, { useState } from 'react';
import axios from 'axios';
import './form.css'; // CSS file import for form

const SignupForm = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'patient',  // Default role as patient
        age: '',
        gender: '',
        country: '',
        state: '',
        hospitalName: '',
        certificationId: '',
        qualification: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('/api/auth/signup', formData);
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
                <input type="text" name="name" placeholder="Name" onChange={handleChange} required />
                <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
                <input type="password" name="password" placeholder="Password" onChange={handleChange} required />

                <select name="role" onChange={handleChange}>
                    <option value="patient">Patient</option>
                    <option value="doctor">Doctor</option>
                </select>

                {/* Additional fields for Patients */}
                {formData.role === 'patient' && (
                    <>
                        <input type="number" name="age" placeholder="Age" onChange={handleChange} />
                        <input type="text" name="gender" placeholder="Gender" onChange={handleChange} />
                        <input type="text" name="country" placeholder="Country" onChange={handleChange} />
                        <input type="text" name="state" placeholder="State" onChange={handleChange} />
                    </>
                )}

                {/* Additional fields for Doctors */}
                {formData.role === 'doctor' && (
                    <>
                        <input type="text" name="hospitalName" placeholder="Hospital Name" onChange={handleChange} />
                        <input type="text" name="certificationId" placeholder="Certification ID" onChange={handleChange} />
                        <input type="text" name="qualification" placeholder="Qualification" onChange={handleChange} />
                    </>
                )}

                <button type="submit" className="btn">Sign Up</button> {/* Class added for styling */}
            </form>
        </div>
    );
};

export default SignupForm;
