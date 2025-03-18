import express from "express";
import fs from "fs";
import path from "path";

import {
  createPost,
  updatePost,
  deletePost,
  getPost,
  getAllPosts,
  votePost,
  searchPosts,
} from "../controller/post-controller.js";
import {
  uploadImage,
  getImage,
  listAllFiles,
} from "../controller/image-controller.js";
import {
  newComment,
  getComments,
  deleteComment,
  voteComment,
  updateComment,
} from "../controller/comment-controller.js";
import {
  loginUser,
  singupUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  getUserStats,
} from "../controller/user-controller.js";
import {
  authenticateToken,
  createNewToken,
} from "../controller/jwt-controller.js";
import {
  updateHealthProfile,
  getHealthProfile,
  getHealthRecommendations,
  analyzeHealthData,
} from "../controller/health-controller.js";

import upload from "../utils/upload.js";

const router = express.Router();

router.post("/login", loginUser);
router.post("/signup", singupUser);
router.post("/logout", logoutUser);

router.post("/token", createNewToken);

router.post("/create", authenticateToken, createPost);
router.put("/update/:id", authenticateToken, updatePost);
router.delete("/delete/:id", authenticateToken, deletePost);

router.get("/post/:id", authenticateToken, getPost);
router.get("/posts", authenticateToken, getAllPosts);
router.get("/posts/search", authenticateToken, searchPosts);

router.get("/user/:username", authenticateToken, getUserProfile);
router.put("/user/:username", authenticateToken, updateUserProfile);
router.get("/user/:username/stats", authenticateToken, getUserStats);

// Health profile routes
router.post("/health/profile", authenticateToken, updateHealthProfile);
router.get("/health/profile/:username", authenticateToken, getHealthProfile);
router.get(
  "/health/recommendations/:username",
  authenticateToken,
  getHealthRecommendations
);
router.post("/health/analyze", authenticateToken, analyzeHealthData);

router.post("/file/upload", upload.single("file"), uploadImage);
router.get("/file/:filename", getImage);
router.get("/files/list", listAllFiles);

router.get("/test-image", (req, res) => {
  const imagePath = path.join(process.cwd(), "public", "test-image.jpg");

  if (fs.existsSync(imagePath)) {
    res.setHeader("Content-Type", "image/jpeg");
    fs.createReadStream(imagePath).pipe(res);
  } else {
    res.setHeader("Content-Type", "image/svg+xml");
    res.send(`<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="200" fill="#3498db"/>
      <text x="50" y="100" font-family="Arial" font-size="20" fill="white">Test Image</text>
    </svg>`);
  }
});

router.post("/comment/new", authenticateToken, newComment);
router.get("/comments/:id", authenticateToken, getComments);
router.delete("/comment/delete/:id", authenticateToken, deleteComment);
router.put("/comment/update/:id", authenticateToken, updateComment);

router.post("/post/vote/:id", authenticateToken, votePost);
router.post("/comment/vote/:id", authenticateToken, voteComment);

export default router;
