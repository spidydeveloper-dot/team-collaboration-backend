const express = require("express");
const router = express.Router();

const authRoutes = require("./authRoutes");
const projectRoutes = require("./projectRoutes");
const taskRoutes = require("./taskRoutes");
const messageRoutes = require("./messageRoutes");
const teamRoutes = require("./teamRoutes");

// Mount routes
router.use("/auth", authRoutes);
router.use("/projects", projectRoutes);
router.use("/tasks", taskRoutes);
router.use("/messages", messageRoutes);
router.use("/teams", teamRoutes);

// Health check endpoint
router.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API is running",
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
