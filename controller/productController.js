import Product from "../model/product.js";
import ProductSeller from "../model/productSeller.js";
import { deleteFromCloudinary, uploadToCloudinary } from "../utils/cloudinary.js";

export const createProduct = async (req, res) => {
    try {
        const { name, description, base_price, category, video, stock, price } = req.body;
        const sellerId = req.user.userId;

        if(!name || !description || !base_price) {
            return res.status(400).json({ message: 'Name, description, and base price are required' });
        }
        
        // Check if the base product already exists to avoid duplicates
        let existingProduct = await Product.findOne({ name, category });
        if (existingProduct) {
            return res.status(400).json({ 
                message: 'This product already exists in the catalog. Please use the "Add Offering" endpoint to list your stock for it.',
                productId: existingProduct._id 
            });
        }

        const newProduct = new Product({
            name,
            description,
            base_price,
            category,
            video,
            images: []
        });
        await newProduct.save();

        // Create the initial seller listing
        const productSeller = new ProductSeller({
            product: newProduct._id,
            seller: sellerId,
            price: price || base_price,
            stock: stock || 0,
            isAvailable: (stock || 0) > 0
        });
        await productSeller.save();

        // Trigger background upload if files are present
        if (req.files && req.files.length > 0) {
            uploadImagesInBackground(newProduct._id, req.files);
        }

        res.status(201).json({ 
            message: 'Product and seller listing created successfully.', 
            product: newProduct,
            sellerListing: productSeller
        });
    } catch (error) {
        res.status(500).json({ message: 'Error creating product', error: error.message });
    }
};

export const addOffering = async (req, res) => {
    try {
        const { productId, price, stock } = req.body;
        const sellerId = req.user.userId;

        if (!productId || price === undefined || stock === undefined) {
            return res.status(400).json({ message: 'ProductId, price, and stock are required' });
        }

        // Verify product exists
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found in catalog' });
        }

        // Check if the seller already has an offering for this product
        const existingOffering = await ProductSeller.findOne({ product: productId, seller: sellerId });
        if (existingOffering) {
            return res.status(400).json({ 
                message: 'You already have an active listing for this product. Please use the update endpoint to modify it.' 
            });
        }

        // Create the new Seller listing
        const productSeller = new ProductSeller({
            product: productId,
            seller: sellerId,
            price,
            stock,
            isAvailable: stock > 0
        });
        await productSeller.save();

        res.status(201).json({ 
            message: 'Your offering has been added successfully.', 
            sellerListing: productSeller
        });
    } catch (error) {
        res.status(500).json({ message: 'Error adding offering', error: error.message });
    }
};

export const getProducts = async (req, res) => {
    try {
        //pagination
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const sortBy = req.query.sortBy || 'createdAt';
        const sortOrder = req.query.sort === 'asc' ? 1 : -1;
        
        const products = await Product.find().skip(skip).limit(limit).sort({ [sortBy]: sortOrder });
        res.json({ message: 'List of products', products, page, limit });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching products', error });
    }
};

export const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json({ message: 'Product details', product });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching product', error });
    }
};

export const updateProduct = async (req, res) => {
    try {
        const { name, description, base_price, category, images, video } = req.body;
        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            { name, description, base_price, category },
            { new: true }
        );
        if (!updatedProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json({ message: 'Product updated', product: updatedProduct });
    } catch (error) {
        res.status(500).json({ message: 'Error updating product', error });
    }
};

export const deleteProduct = async (req, res) => {
    try {
        const deletedProduct = await Product.findByIdAndDelete(req.params.id);
        if (!deletedProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }
        const imagesToDelete = deletedProduct.images.map(img => img.publicId);
        if(imagesToDelete.length > 0) {
            await deleteImagesFromCloudinary(imagesToDelete);
        }
        res.json({ message: 'Product deleted', product: deletedProduct });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting product', error });
    }
};

const uploadImagesInBackground = async (productId, files) => {
    try {
        const uploadPromises = files.map(file => uploadToCloudinary(file.buffer));
        const results = await Promise.all(uploadPromises);

        const images = results.map(result => ({
            url: result.secure_url,
            publicId: result.public_id
        }));

        await Product.findByIdAndUpdate(productId, { $set: { images: images } });
        console.log(`Images updated for product ${productId}`);
    } catch (error) {
        console.error(`Error uploading images for product ${productId}:`, error);
    }
};

const deleteImagesFromCloudinary = async (publicIds) => {
    try {
        const deletePromises = publicIds.map(id => deleteFromCloudinary(id));
        await Promise.all(deletePromises);
    } catch (error) {
        console.error(`Error deleting images from Cloudinary:`, error);
    }
};
