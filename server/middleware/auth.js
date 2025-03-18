const jwt = require("jsonwebtoken");

const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;

  console.log("Checking auth header:", authHeader ? "Found" : "Not found");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.log("No valid authorization header found");
    return res
      .status(401)
      .json({ error: "No valid authentication token provided" });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    console.log("Empty token after Bearer prefix");
    return res.status(401).json({ error: "Empty authentication token" });
  }

  try {
    console.log("Attempting to verify token:", token.substring(0, 15) + "...");

    // Get JWT_SECRET from environment
    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
      console.error("JWT_SECRET is not defined in environment");
      return res
        .status(500)
        .json({ error: "Server authentication configuration error" });
    }

    // Directly use jwt.verify instead of the utility function
    const decoded = jwt.verify(token, JWT_SECRET);

    // Assign the verified user to req.user
    req.user = decoded;
    console.log(
      "Token verified successfully for user:",
      decoded._id || decoded.id
    );
    next();
  } catch (err) {
    console.error("JWT verification error:", err.message);
    return res
      .status(403)
      .json({ error: "Authentication failed: " + err.message });
  }
};

module.exports = { authenticateJWT };
