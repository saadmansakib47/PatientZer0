// utils/socketEvents.js

function emitUserRegistered(io, userData) {
    // Ensure io is defined and passed correctly
    if (io) {
        io.emit('userRegistered', userData);
    } else {
        console.error('Socket.IO instance is not defined.');
    }
}

module.exports = { emitUserRegistered };
