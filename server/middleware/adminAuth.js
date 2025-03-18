const jwt = require("jsonwebtoken");
const User = require("../models/User");

const adminAuth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    console.log("Admin Auth - Token received:", token ? "Yes" : "No");

    if (!token) {
      console.log("Admin Auth - No token provided");
      return res
        .status(401)
        .json({ message: "No token, authorization denied" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Admin Auth - Decoded token payload:", decoded);

    // Extract user ID from token - could be in _id field or userId field
    const userId = decoded._id || decoded.userId;
    console.log("Admin Auth - User ID from token:", userId);

    if (!userId) {
      console.log("Admin Auth - No user ID in token");
      return res.status(401).json({ message: "Invalid token format" });
    }

    const user = await User.findById(userId);

    if (!user) {
      console.log("Admin Auth - User not found");
      return res.status(401).json({ message: "User not found" });
    }

    console.log("Admin Auth - User role:", user.role);

    if (user.role !== "admin") {
      console.log("Admin Auth - Access denied: Not an admin");
      return res.status(403).json({ message: "Access denied: Not an admin" });
    }

    req.user = user;
    req.token = token;
    console.log("Admin Auth - Admin verified, proceeding");
    next();
  } catch (error) {
    console.error("Admin Auth - Error:", error.message);
    res.status(401).json({ message: "Token is not valid" });
  }
};

module.exports = adminAuth;
