import express from "express";
import { protect, authorize } from "../middleware/authMiddleware.js";
import {
  registerUser,
  loginUser,
  getProfile,
  updateSkills,
} from "../controllers/userController.js";
import { authLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

// USER + ADMIN PROTECTED DASHBOARD (EXP NO. 6)
router.get("/dashboard", protect, (req, res) => {
  res.json({
    message: "Welcome to the protected dashboard",
    user: req.user,
  });
});

// ADMIN ONLY PROTECTED ROUTE (EXP NO. 6)
router.get("/admin", protect, authorize("admin"), (req, res) => {
  res.json({
    message: "Welcome Admin! You can access this page.",
  });
});

// Profile Route (Protected)
router.get("/profile", protect, getProfile);

// Update Skills Route (Protected)
router.put("/skills", protect, updateSkills);

// Backward-compatible Auth Endpoints for SkillSync frontend
router.post("/register", authLimiter, registerUser);
router.post("/login", authLimiter, loginUser);

export default router;
