import ProductSeller from "../model/productSeller.js";
import Order from "../model/order.js";

export const getSellerListings = async (req, res) => {
    try {
        const sellerId = req.user.userId;
        const listings = await ProductSeller.find({ seller: sellerId }).populate('product');
        res.json({ success: true, listings });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching listings", error: error.message });
    }
};

export const getSellerOrders = async (req, res) => {
    try {
        const sellerId = req.user.userId;
        const orders = await Order.find({ seller: sellerId })
            .populate('product', 'name')
            .populate('user', 'username email')
            .sort({ createdAt: -1 });
        res.json({ success: true, orders });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching orders", error: error.message });
    }
};

export const updateSellerListing = async (req, res) => {
    try {
        const { id } = req.params;
        const sellerId = req.user.userId;
        const { price, stock } = req.body;

        const listing = await ProductSeller.findOneAndUpdate(
            { _id: id, seller: sellerId },
            { price, stock },
            { returnDocument: 'after' }
        );

        if (!listing) {
            return res.status(404).json({ success: false, message: "Listing not found or unauthorized" });
        }

        res.json({ success: true, message: "Listing updated successfully", listing });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error updating listing", error: error.message });
    }
};
