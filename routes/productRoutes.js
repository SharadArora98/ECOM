import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import roleMiddleware from '../middleware/roleMiddleware.js';
import { getProducts, getProductById, createProduct, updateProduct, deleteProduct, addOffering, getSellerListingsByProductId } from '../controller/productController.js';
import { uploadImages } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.get('/',authMiddleware, getProducts);

router.get('/:id', authMiddleware, getProductById);

router.get('/:id/listings', authMiddleware, getSellerListingsByProductId);

router.post('/add', authMiddleware, roleMiddleware('seller'), uploadImages, createProduct);

router.post('/add-offering', authMiddleware, roleMiddleware('seller'), addOffering);

router.put('/update/:id', authMiddleware, roleMiddleware('seller'), updateProduct);

router.delete('/delete/:id', authMiddleware, roleMiddleware('seller'), deleteProduct);
export default router;