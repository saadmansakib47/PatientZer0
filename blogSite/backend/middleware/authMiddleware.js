const jwt = require('jsonwebtoken');

exports.verifyToken = (req, res, next) => {
    const token = req.headers['authorization']; // or however you're getting the token

    if (!token) {
        return res.status(403).send({ message: 'No token provided!' });
    }

    const tokenParts = token.split(' '); // If your token is expected to be in "Bearer <token>" format
    if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
        return res.status(401).send({ message: 'Invalid token format!' });
    }

    const jwtToken = tokenParts[1];

    jwt.verify(jwtToken, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).send({ message: 'Unauthorized!' });
        }
        req.userId = decoded.id;
        next();
    });
};
