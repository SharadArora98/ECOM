import mongoose from "mongoose";

const productSellerSchema = new mongoose.Schema({
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
    price: {
        type: Number,
        required: true,
        min: 0,
    },
    stock: {
        type: Number,
        required: true,
        min: 0,
        default: 0,
    },
    isAvailable: {
        type: Boolean,
        default: true,
    },
    discount: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
    }
}, {
    timestamps: true,
});

productSellerSchema.index({ product: 1, seller: 1 }, { unique: true });

const ProductSeller = mongoose.model("ProductSeller", productSellerSchema);

export default ProductSeller;
