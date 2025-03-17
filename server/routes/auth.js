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
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, age, gender, country, state } = req.body;

    // Check if the email is already registered
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "An account with this email already exists." });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user with default role as patient
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: "patient",
      additionalInfo: {
        age,
        gender,
        country,
        state
      }
    });

    // Save the new user
    await newUser.save();
    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    console.error("Error during signup:", error);
    res.status(500).json({ error: "An error occurred during signup" });
  }
});

// Doctor verification route
router.post("/verify-doctor", authenticateJWT, async (req, res) => {
  try {
    const { hospitalName, certificationId, qualification, degreeProof } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Update user role and doctor verification details
    user.role = "doctor";
    user.additionalInfo = {
      ...user.additionalInfo,
      hospitalName,
      certificationId,
      qualification,
      degreeProof,
      isDoctorVerified: false,
      verificationStatus: "pending"
    };

    await user.save();
    res.status(200).json({ message: "Doctor verification request submitted successfully" });
  } catch (error) {
    console.error("Error during doctor verification:", error);
    res.status(500).json({ error: "An error occurred during doctor verification" });
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
