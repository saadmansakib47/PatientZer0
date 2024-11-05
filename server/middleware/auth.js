const jwt = require('jsonwebtoken');
const { verifyToken } = require('../utils/jwtUtils');

const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        const token = authHeader.split(' ')[1];
        try {
            req.user = verifyToken(token);
            next();
        } catch (err) {
            return res.sendStatus(403); // Forbidden
        }
    } else {
        res.sendStatus(401); // Unauthorized
    }
};

module.exports = authenticateJWT;
