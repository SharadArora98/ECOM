import mongoose from "mongoose";

const imageSchema = new mongoose.Schema({
    url: {
        type: String,
        required: true,
    },
    publicId: {
        type: String,
        required: true,
    },
});

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        required: true,
        trim: true,
        maxlength: 500,
    },
    base_price: {
        type: Number,
        required: true,
        min: 0,
    },
    category: {
        type: String,
        trim: true,
    },
    images: [imageSchema],
    video: {
        type: String,
    },
}, {
    timestamps: true,
});

const Product = mongoose.model("Product", productSchema);

export default Product;