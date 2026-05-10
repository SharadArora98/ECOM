import express from "express";
import authController from "../controller/authController.js";

const router = express.Router();

// Register route
router.post("/register", authController.register);
// Login route
router.post("/login", authController.login);

export default router;