const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authenticateJWT = require('../middleware/auth');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

// Signup route
// routes/auth.js
router.post('/signup', async (req, res) => {
    try {
        const {
            name, email, password, role, age, gender, country, state,
            hospitalName, certificationId, qualification, profilePhoto
        } = req.body;

        // Check if the email is already registered
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'An account with this email already exists.' });
        }

        // If role is doctor, check for unique certification ID
        if (role === 'doctor' && certificationId) {
            const existingCertId = await User.findOne({ "additionalInfo.certificationId": certificationId });
            if (existingCertId) {
                return res.status(400).json({ error: 'This Certification ID is already in use.' });
            }
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user data based on the role
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            role,
            profilePhoto: profilePhoto || null,
            additionalInfo: {
                age: role === 'patient' ? age : undefined,
                gender: role === 'patient' ? gender : undefined,
                country: role === 'patient' ? country : undefined,
                state: role === 'patient' ? state : undefined,
                hospitalName: role === 'doctor' ? hospitalName : undefined,
                certificationId: role === 'doctor' ? certificationId : undefined,
                qualification: role === 'doctor' ? qualification : undefined,
            }
        });

        // Save the new user
        await newUser.save();
        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        console.error('Error during signup:', error);

        // Check for MongoDB validation errors (e.g., unique constraints)
        if (error.code === 11000) {
            if (error.keyPattern && error.keyPattern["additionalInfo.certificationId"]) {
                return res.status(400).json({ error: 'This Certification ID is already in use.' });
            }
        }

        res.status(500).json({ error: 'An error occurred during signup' });
    }
});

// Login route
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        // Check if password is correct
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        // Create JWT token with more user details
        const token = jwt.sign(
            { _id: user._id, name: user.name, role: user.role, email: user.email },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        // Send the token and user details in response
        res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                profilePhoto: user.profilePhoto,
                additionalInfo: user.additionalInfo
            }
        });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ error: 'An error occurred during login' });
    }
});

// Protected profile route
router.get('/profile', authenticateJWT, async (req, res) => {
    try {
        // Find user by ID from JWT token
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Send user profile data
        res.status(200).json({
            name: user.name,
            email: user.email,
            role: user.role,
            profilePhoto: user.profilePhoto,
            additionalInfo: user.additionalInfo
        });
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ error: 'An error occurred while fetching the profile' });
    }
});

module.exports = router;