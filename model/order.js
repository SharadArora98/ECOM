import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    listing: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ProductSeller",
        required: true,
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
    },
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    quantity: {
        type: Number,
        default: 1,
    },
    totalAmount: {
        type: Number,
        required: true,
    },
    stripeSessionId: {
        type: String,
        required: true,
        unique: true, // Idempotency: prevents duplicate orders from same webhook
    },
    status: {
        type: String,
        enum: ["pending", "paid", "failed", "refund_required"],
        default: "pending",
    },
    paymentStatus: {
        type: String,
        default: "unpaid",
    }
}, {
    timestamps: true,
});

const Order = mongoose.model("Order", orderSchema);

export default Order;
