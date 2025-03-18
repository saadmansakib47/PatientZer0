const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { authenticateJWT } = require("../middleware/auth");
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
    const { name, email, password, age, gender, country, state, role } =
      req.body;

    console.log(`Signup attempt for email: ${email}`);

    // Check if the email is already registered
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ error: "An account with this email already exists." });
    }

    // Let User model handle password hashing in middleware
    // We don't need to hash it here
    // const hashedPassword = await bcrypt.hash(password, 10);

    // Use the provided role or default to "patient"
    const userRole = role === "doctor" ? "doctor" : "patient";

    // Create new user with plain password - middleware will hash it
    const newUser = new User({
      name,
      email,
      password: password, // Not pre-hashed - Let the middleware handle it
      role: userRole,
      additionalInfo: {
        age,
        gender,
        country,
        state,
        isDoctorVerified: userRole === "doctor" ? false : undefined,
        verificationStatus: userRole === "doctor" ? "pending" : undefined,
      },
    });

    console.log(`Created user object with plain password for: ${email}`);

    // Save the new user - this will trigger password hashing in the middleware
    await newUser.save();
    console.log(`User saved with hashed password: ${email}`);

    // Create JWT token for immediate login
    const token = jwt.sign(
      {
        _id: newUser._id,
        name: newUser.name,
        role: newUser.role,
        email: newUser.email,
      },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Return token and user details for immediate login
    res.status(201).json({
      message: "User created successfully",
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error("Error during signup:", error);
    res.status(500).json({ error: "An error occurred during signup" });
  }
});

// Doctor verification route
router.post("/verify-doctor", authenticateJWT, async (req, res) => {
  try {
    const { hospitalName, certificationId, qualification, degreeProof } =
      req.body;
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
      verificationStatus: "pending",
    };

    await user.save();
    res
      .status(200)
      .json({ message: "Doctor verification request submitted successfully" });
  } catch (error) {
    console.error("Error during doctor verification:", error);
    res
      .status(500)
      .json({ error: "An error occurred during doctor verification" });
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

    console.log(`Login attempt - Email: ${email}`);

    const user = await User.findOne({ email });
    if (!user) {
      console.log(`Login failed - User not found: ${email}`);
      return res.status(400).json({ error: "Invalid email or password" });
    }

    console.log(
      `User found - Email: ${email}, Role: ${user.role}, Active: ${user.isActive}`
    );

    // Check if password is correct
    console.log(
      `Comparing password for ${email} - Password exists: ${!!user.password}, Length: ${
        user.password?.length || 0
      }`
    );
    const isMatch = await bcrypt.compare(password, user.password);
    console.log(`Password comparison result for ${email}: ${isMatch}`);

    if (!isMatch) {
      console.log(`Login failed - Invalid password for user: ${email}`);
      return res.status(400).json({ error: "Invalid email or password" });
    }

    // Check if account is active
    console.log(
      `Login attempt - User: ${user.email}, Role: ${user.role}, isActive: ${user.isActive}`
    );
    if (user.isActive === false) {
      if (
        user.role === "doctor" &&
        user.additionalInfo?.verificationStatus === "pending"
      ) {
        return res.status(403).json({
          error: "Your doctor account is pending approval",
          verificationStatus: user.additionalInfo?.verificationStatus,
          redirect: "/doctor/waiting",
        });
      } else {
        return res
          .status(403)
          .json({
            error: "Your account has been deactivated. Please contact support.",
          });
      }
    }

    // Create JWT token with more user details
    const token = jwt.sign(
      { _id: user._id, name: user.name, role: user.role, email: user.email },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    console.log(`Login successful - User: ${email}, Role: ${user.role}`);

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

// Verify token endpoint
router.get("/verify", authenticateJWT, (req, res) => {
  try {
    // If middleware passes, token is valid
    console.log("Token verified for user:", req.user?._id || req.user?.id);

    // Return the user data from the request (attached by the middleware)
    return res.status(200).json({
      user: {
        id: req.user._id || req.user.id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        isActive: req.user.isActive || true,
        additionalInfo: req.user.additionalInfo,
      },
      message: "Token is valid",
    });
  } catch (error) {
    console.error("Token verification error:", error);
    return res.status(401).json({ message: "Invalid token" });
  }
});

module.exports = router;
