// auth.js from route
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authenticateJWT = require('../middleware/auth');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

// Signup route
router.post('/signup', async (req, res) => {
    try {
        const { name, email, password, role, age, gender, country, state, hospitalName, certificationId, qualification } = req.body;

        // Check if the user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            role,
            profilePhoto: req.body.profilePhoto || null,
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

        await newUser.save();
        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        console.error('Error during signup:', error);
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

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        // Create a JWT token
        const token = jwt.sign(
            { _id: user._id, name: user.name, role: user.role },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(200).json({
            message: 'Login successful',
            token,
            user: { name: user.name, role: user.role, email: user.email }
        });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ error: 'An error occurred during login' });
    }
});

// Protected profile route
router.get('/profile', authenticateJWT, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json({
            name: user.name,
            email: user.email,
            role: user.role,
            additionalInfo: user.additionalInfo
        });
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ error: 'An error occurred while fetching the profile' });
    }
});

module.exports = router;
