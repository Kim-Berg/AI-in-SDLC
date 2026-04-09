import express from 'express';
import cors from 'cors';
import { productsRouter } from './routes/products.js';
import { cartRouter } from './routes/cart.js';
import { authRouter } from './routes/auth.js';
import { errorHandler } from './middleware/error.js';

export const app = express();

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'zava-api' });
});

// Routes
app.use('/api/auth', authRouter);
app.use('/api/products', productsRouter);
app.use('/api/cart', cartRouter);

// Error handling
app.use(errorHandler);
