import express from "express";
import authController from "../controller/authController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { loginLimiter } from "../middleware/rateLimitMiddleware.js";

const router = express.Router();

// Register route
router.post("/register", authController.register);
// Login route
router.post("/login", loginLimiter, authController.login);
router.post("/changePassword", authMiddleware, authController.changePassword);

export default router;