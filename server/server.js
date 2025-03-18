// Load environment variables first
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });

// Debug environment variables
console.log(
  "Environment variables loaded from:",
  path.resolve(__dirname, ".env")
);
console.log("PORT:", process.env.PORT);
console.log("MONGO_URI:", process.env.MONGO_URI);
console.log("JWT_SECRET:", process.env.JWT_SECRET ? "Set" : "Not set");
console.log("SESSION_SECRET:", process.env.SESSION_SECRET ? "Set" : "Not set");
console.log("CLIENT_URL:", process.env.CLIENT_URL);
console.log(
  "GOOGLE_CLIENT_ID:",
  process.env.GOOGLE_CLIENT_ID ? "Set" : "Not set"
);
console.log(
  "GOOGLE_CLIENT_SECRET:",
  process.env.GOOGLE_CLIENT_SECRET ? "Set" : "Not set"
);

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { createServer } = require("http");
const { Server } = require("socket.io");
const passport = require("passport");
const session = require("express-session");
const { createProxyMiddleware } = require("http-proxy-middleware");
const authRoutes = require("./routes/auth");
const messageRoutes = require("./routes/messages");
const blogRoutes = require("./routes/blogRoutes");
const { authenticateJWT } = require("./middleware/auth");
const savedReportRoutes = require("./routes/savedReportRoutes");
const doctorRoutes = require("./routes/doctorRoutes");
const adminRoutes = require("./routes/adminRoutes");
const healthRoutes = require("./routes/healthRoutes");
// const patientRoutes = require("./routes/patientRoutes");
// const communityRoutes = require("./routes/communityRoutes");
// const doctorAPIRoutes = require("./routes/doctorAPIRoutes");

// Initialize Express app
const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});
const PORT = process.env.PORT || 5001;
const BLOG_SERVER_PORT = 8000;

// CORS configuration
const clientUrl = process.env.CLIENT_URL || "http://localhost:3000";
app.use(
  cors({
    origin: clientUrl,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Log CORS configuration
console.log(`CORS configured with origin: ${clientUrl}`);

app.use(express.json());

// Serve static files from uploads directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
// Also serve from the root uploads directory
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your_session_secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    },
  })
);

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Import Passport config
require("./config/passport");

// Routes
app.use("/api/auth", authRoutes);
// app.use("/api/patient", patientRoutes);
app.use("/api/messages", authenticateJWT, messageRoutes);
app.use("/api/doctor", doctorRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/saved-reports", savedReportRoutes);
app.use("/api/health", healthRoutes);

// Blog Integration - Proxy to the blog server
// This will forward requests from /blog-api/* to the blog server
app.use(
  "/blog-api",
  createProxyMiddleware({
    target: `http://localhost:${BLOG_SERVER_PORT}`,
    changeOrigin: true,
    pathRewrite: {
      "^/blog-api": "/", // Remove /blog-api prefix when forwarding
    },
    onProxyReq: (proxyReq, req, res) => {
      // If the main app has an authentication token, can transfer it to the blog server
      if (req.headers.authorization) {
        proxyReq.setHeader("Authorization", req.headers.authorization);
      }
    },
  })
);

// Blog static files proxy - for images and other static assets
app.use(
  "/blog-static",
  createProxyMiddleware({
    target: `http://localhost:${BLOG_SERVER_PORT}`,
    changeOrigin: true,
    pathRewrite: {
      "^/blog-static": "/", // Remove /blog-static prefix when forwarding
    },
  })
);

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Socket.io connection
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);
  socket.on("disconnect", () => console.log("User disconnected:", socket.id));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Global error handler:", err);
  const statusCode = err.statusCode || 500;
  let errorMessage = err.message || "An unexpected error occurred";

  // Add more details for validation errors
  if (err.name === "ValidationError") {
    const validationErrors = Object.keys(err.errors)
      .map((key) => {
        return `${key}: ${err.errors[key].message}`;
      })
      .join(", ");
    errorMessage = `Validation error: ${validationErrors}`;
  }

  res.status(statusCode).json({
    error: errorMessage,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Export app for testing
module.exports = app;
