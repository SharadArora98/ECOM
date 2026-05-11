import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import roleMiddleware from '../middleware/roleMiddleware.js';
import { getProducts, getProductById, createProduct, updateProduct, deleteProduct } from '../controller/productController.js';
import { uploadImages } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.get('/',authMiddleware, getProducts);

router.get('/:id', authMiddleware, getProductById);

router.post('/add', authMiddleware, roleMiddleware('seller'), uploadImages, createProduct);

router.put('/update/:id', authMiddleware, roleMiddleware('seller'), updateProduct);

router.delete('/delete/:id', authMiddleware, roleMiddleware('seller'), deleteProduct);
export default router;