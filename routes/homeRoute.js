import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', authMiddleware, (req, res) => {
    res.json({ message: `Welcome to the Homepage, ${req.user.username}!` });
});

export default router;
