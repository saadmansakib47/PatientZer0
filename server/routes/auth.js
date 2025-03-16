const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const authenticateJWT = require("../middleware/auth");
const passport = require("passport");
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key";

// Google OAuth routes - only if credentials are configured
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  console.log("Google OAuth routes enabled");

  router.get(
    "/google",
    (req, res, next) => {
      console.log("Google OAuth request received");
      next();
    },
    passport.authenticate("google", {
      scope: ["profile", "email"],
      prompt: "select_account",
    })
  );

  router.get(
    "/google/callback",
    (req, res, next) => {
      console.log("Google OAuth callback received");
      next();
    },
    passport.authenticate("google", {
      failureRedirect: "/login",
      failWithError: true,
    }),
    (req, res) => {
      try {
        console.log(
          "Google authentication successful for user:",
          req.user.email
        );

        // Create JWT token for the authenticated user
        const token = jwt.sign(
          {
            _id: req.user._id,
            name: req.user.name,
            role: req.user.role,
            email: req.user.email,
          },
          JWT_SECRET,
          { expiresIn: "1h" }
        );

        const redirectUrl = `${
          process.env.CLIENT_URL || "http://localhost:3000"
        }/oauth-callback?token=${token}`;

        console.log("Redirecting to:", redirectUrl);

        // Redirect to frontend with token
        res.redirect(redirectUrl);
      } catch (error) {
        console.error("Error in Google OAuth callback:", error);
        res.redirect(
          `${
            process.env.CLIENT_URL || "http://localhost:3000"
          }/login?error=auth_failed`
        );
      }
    },
    (err, req, res, next) => {
      console.error("Google authentication error:", err);
      res.redirect(
        `${
          process.env.CLIENT_URL || "http://localhost:3000"
        }/login?error=auth_failed`
      );
    }
  );
} else {
  // Fallback routes when Google OAuth is not configured
  router.get("/google", (req, res) => {
    res
      .status(501)
      .json({ error: "Google OAuth is not configured on the server" });
  });

  router.get("/google/callback", (req, res) => {
    res
      .status(501)
      .json({ error: "Google OAuth is not configured on the server" });
  });
}

// Signup route
// routes/auth.js
router.post("/signup", async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      age,
      gender,
      country,
      state,
      hospitalName,
      certificationId,
      qualification,
      profilePhoto,
    } = req.body;

    // Check if the email is already registered
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ error: "An account with this email already exists." });
    }

    // If role is doctor, check for unique certification ID
    if (role === "doctor" && certificationId) {
      const existingCertId = await User.findOne({
        "additionalInfo.certificationId": certificationId,
      });
      if (existingCertId) {
        return res
          .status(400)
          .json({ error: "This Certification ID is already in use." });
      }
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user data based on the role
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role,
      profilePhoto: profilePhoto || null,
      additionalInfo: {
        age: role === "patient" ? age : undefined,
        gender: role === "patient" ? gender : undefined,
        country: role === "patient" ? country : undefined,
        state: role === "patient" ? state : undefined,
        hospitalName: role === "doctor" ? hospitalName : undefined,
        certificationId: role === "doctor" ? certificationId : undefined,
        qualification: role === "doctor" ? qualification : undefined,
      },
    });

    // Save the new user
    await newUser.save();
    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    console.error("Error during signup:", error);

    // Check for MongoDB validation errors (e.g., unique constraints)
    if (error.code === 11000) {
      if (
        error.keyPattern &&
        error.keyPattern["additionalInfo.certificationId"]
      ) {
        return res
          .status(400)
          .json({ error: "This Certification ID is already in use." });
      }
    }

    res.status(500).json({ error: "An error occurred during signup" });
  }
});

// Login route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    // Check if password is correct
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    // Create JWT token with more user details
    const token = jwt.sign(
      { _id: user._id, name: user.name, role: user.role, email: user.email },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Send the token and user details in response
    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePhoto: user.profilePhoto,
        additionalInfo: user.additionalInfo,
      },
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ error: "An error occurred during login" });
  }
});

// Protected profile route
router.get("/profile", authenticateJWT, async (req, res) => {
  try {
    // Find user by ID from JWT token
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Send user profile data
    res.status(200).json({
      name: user.name,
      email: user.email,
      role: user.role,
      profilePhoto: user.profilePhoto,
      additionalInfo: user.additionalInfo,
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching the profile" });
  }
});

module.exports = router;
