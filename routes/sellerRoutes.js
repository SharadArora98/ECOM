import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";
import { getSellerListings, getSellerOrders, updateSellerListing } from "../controller/sellerController.js";

const router = express.Router();

router.get("/dashboard", authMiddleware, roleMiddleware("seller"), (req, res) => {
    res.json({ message: `Welcome to your seller dashboard, ${req.user.username}!` });
});

router.get("/listings", authMiddleware, roleMiddleware("seller"), getSellerListings);
router.get("/orders", authMiddleware, roleMiddleware("seller"), getSellerOrders);
router.put("/listings/:id", authMiddleware, roleMiddleware("seller"), updateSellerListing);

export default router;