import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get("/dashboard",authMiddleware, roleMiddleware("seller"), (req, res) => {
    res.json({ message: `Welcome to your seller dashboard, ${req.user.username}!` });
});

export default router;