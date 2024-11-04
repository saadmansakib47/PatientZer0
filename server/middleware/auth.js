const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'JWT_SECRET'; // Ensure this is set in your environment variables

// Middleware to authenticate JWT
const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (authHeader) {
        const token = authHeader.split(' ')[1]; // Extract the token after 'Bearer'

        jwt.verify(token, JWT_SECRET, (err, user) => {
            if (err) {
                return res.sendStatus(403); // Forbidden if token verification fails
            }
            req.user = user; // Attach the user information to the request object
            next(); // Proceed to the next middleware or route handler
        });
    } else {
        res.sendStatus(401); // Unauthorized if no token is provided
    }
};

module.exports = authenticateJWT;
