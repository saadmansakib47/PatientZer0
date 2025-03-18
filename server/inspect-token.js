const jwt = require("jsonwebtoken");
require("dotenv").config();

// Function to decode a JWT token without verification
function decodeToken(token) {
  try {
    // Remove 'Bearer ' prefix if present
    const cleanToken = token.startsWith("Bearer ") ? token.slice(7) : token;

    // Decode without verification to check structure
    const decoded = jwt.decode(cleanToken, { complete: true });
    console.log("Decoded token structure:", JSON.stringify(decoded, null, 2));

    // Now try to verify with the secret
    const verified = jwt.verify(cleanToken, process.env.JWT_SECRET);
    console.log("Verified token payload:", JSON.stringify(verified, null, 2));

    return { success: true, decoded: verified };
  } catch (error) {
    console.error("Token error:", error.message);
    return { success: false, error: error.message };
  }
}

// Get token from command line argument
const token = process.argv[2];

if (!token) {
  console.log("Please provide a token as a command line argument");
  process.exit(1);
}

console.log("JWT_SECRET is set:", !!process.env.JWT_SECRET);
const result = decodeToken(token);
console.log("Result:", result.success ? "Token is valid" : "Token is invalid");
