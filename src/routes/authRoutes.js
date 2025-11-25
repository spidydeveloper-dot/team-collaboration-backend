const express = require("express");
const router = express.Router();
const { register, login, getMe } = require("../controllers/authController");
const { registerSchema, loginSchema } = require("../validators/authValidator");
const { validateRequest } = require("../middleware/validateRequest");
const { protect } = require("../middleware/authMiddleware");

// Public routes
router.post("/register", validateRequest(registerSchema), register);
router.post("/login", validateRequest(loginSchema), login);

// Protected routes
router.get("/me", protect, getMe);

module.exports = router;
