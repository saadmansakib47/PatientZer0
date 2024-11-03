const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, required: true },  // 'patient' or 'doctor'
    profilePhoto: { type: String },  // Optional profile photo
    additionalInfo: {
        age: Number,
        gender: String,
        country: String,
        state: String,
        hospitalName: String,  // Only for doctors
        certificationId: String,  // Only for doctors
        qualification: String  // Only for doctors
    },
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);