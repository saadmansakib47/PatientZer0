const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    senderId: {
        type: String,
        required: true,
    },
    receiverId: {
        type: String, // Store the doctor's email
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
});

const Message = mongoose.model('Message', MessageSchema);

module.exports = Message;
