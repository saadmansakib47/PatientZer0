const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const authenticateJWT = require('../middleware/auth'); // Import the authentication middleware

// Get messages for a specific user (doctor or patient)
router.get('/:userId', authenticateJWT, async (req, res) => {
    try {
        const messages = await Message.find({
            $or: [
                { senderId: req.params.userId }, // Messages sent by this user
                { receiverId: req.params.userId }, // Messages received by this user
            ],
        }).sort({ timestamp: 1 }); // Sort messages by timestamp

        res.json(messages);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Send a new message
router.post('/', authenticateJWT, async (req, res) => { // Protect this route
    const { receiverId, content } = req.body; // Assuming senderId comes from the authenticated user

    try {
        const newMessage = new Message({
            senderId: req.user._id, // Get senderId from authenticated user
            receiverId,
            content,
        });

        await newMessage.save();
        res.status(201).json(newMessage);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
