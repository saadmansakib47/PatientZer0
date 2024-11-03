// routes/auth.js
const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const router = express.Router();

// Signup route
router.post('/signup', async (req, res) => {
    try {
        const { name, email, password, role, age, gender, country, state, hospitalName, certificationId, qualification } = req.body;

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
        console.error(error);
        res.status(500).json({ error: 'An error occurred during signup' });
    }
});

// Login route
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        res.status(200).json({ message: 'Login successful', user: { name: user.name, role: user.role, email: user.email } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred during login' });
    }
});

module.exports = router;
