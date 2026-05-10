import express from 'express';
import connectDB from './database/db.js';
import dotenv from 'dotenv';
import dotenvExpand from 'dotenv-expand';

import homeRoute from './routes/homeRoute.js';
import authRoutes from './routes/authRoutes.js';
import sellerRoutes from './routes/sellerRoutes.js';

const myEnv = dotenv.config();
dotenvExpand.expand(myEnv);

const app = express();

app.use(express.json());
app.use('/api/home', homeRoute);
app.use('/api/auth', authRoutes);
app.use('/api/seller',sellerRoutes);

connectDB();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
