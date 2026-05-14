import express from 'express';
import { createCheckoutSession, handleWebhook } from '../controller/paymentController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import roleMiddleware from '../middleware/roleMiddleware.js';

const router = express.Router();

// This route needs JSON parsing
router.post('/create-checkout-session', authMiddleware, roleMiddleware('buyer'),express.json(), createCheckoutSession);

// This route needs RAW parsing for Stripe signature verification
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

export default router;
