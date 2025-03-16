const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'JWT_SECRET_KEY';

const generateToken = (payload, expiresIn = '1h') => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn });
};

const verifyToken = (token) => {
    return jwt.verify(token, JWT_SECRET);
};

module.exports = { generateToken, verifyToken };
