// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const { createServer } = require('http');
const { Server } = require('socket.io');
const authRoutes = require('./routes/auth');

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

app.use('/api/auth', authRoutes);

// Socket.IO logic
let activeUsers = { doctors: [], patients: [] };

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Handle role assignment
    socket.on('setRole', ({ role, userId }) => {
        if (role === 'doctor') {
            activeUsers.doctors.push({ socketId: socket.id, userId });
        } else if (role === 'patient') {
            activeUsers.patients.push({ socketId: socket.id, userId });
        }
    });

    // Patient requests a chat with any available doctor
    socket.on('requestDoctor', (patientData) => {
        if (activeUsers.doctors.length > 0) {
            activeUsers.doctors.forEach((doctor) => {
                io.to(doctor.socketId).emit('chatRequest', { patientId: socket.id, ...patientData });
            });
            socket.emit('requestSent', 'Request sent to available doctors.');
        } else {
            socket.emit('noDoctorsAvailable', 'No doctors are currently available. Please try again later.');
        }
    });

    // Doctor accepts the chat request
    socket.on('acceptRequest', (doctorData) => {
        const { patientSocketId } = doctorData;

        io.to(patientSocketId).emit('startChat', {
            doctorId: socket.id,
            ...doctorData,
        });

        // Join both doctor and patient to a room
        socket.join(patientSocketId);
        socket.join(socket.id);
    });

    // Handle message sending
    socket.on('message', ({ roomId, message }) => {
        io.to(roomId).emit('message', message);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        // Remove user from active users list if needed
    });
});

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
