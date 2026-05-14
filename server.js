import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import connectDB from './database/db.js';
import dotenvExpand from 'dotenv-expand';

import homeRoute from './routes/homeRoute.js';
import authRoutes from './routes/authRoutes.js';
import sellerRoutes from './routes/sellerRoutes.js';
import productRoutes from './routes/productRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';

dotenvExpand.expand({ parsed: process.env });

const app = express();

app.use(cors());

app.use('/api/payment', paymentRoutes);

app.use(express.json());
app.use('/api/home', homeRoute);
app.use('/api/auth', authRoutes);
app.use('/api/seller',sellerRoutes);
app.use('/api/product', productRoutes);

connectDB();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
