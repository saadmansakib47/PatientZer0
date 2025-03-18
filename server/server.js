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
const authRoutes = require("./routes/auth");
const messageRoutes = require("./routes/messages");
const blogRoutes = require("./routes/blogRoutes");
const { authenticateJWT } = require("./middleware/auth");
const savedReportRoutes = require('./routes/savedReportRoutes');

// Initialize Express app
const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});
const PORT = process.env.PORT || 5001;

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
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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
app.use("/api/messages", authenticateJWT, messageRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/saved-reports", savedReportRoutes);

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

// Start server
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
