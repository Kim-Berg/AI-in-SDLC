import { Router, Request, Response } from 'express';
import { prisma } from '../models/prisma.js';

export const productsRouter = Router();

// GET /api/products — list all products
productsRouter.get('/', async (req: Request, res: Response) => {
  const { category } = req.query;

  const where = category ? { category: String(category) } : {};
  const products = await prisma.product.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });

  res.json({ data: products, total: products.length });
});

// GET /api/products/:id — single product
productsRouter.get('/:id', async (req: Request, res: Response) => {
  const product = await prisma.product.findUnique({
    where: { id: req.params.id },
  });

  if (!product) {
    res.status(404).json({ message: 'Product not found', code: 'NOT_FOUND', statusCode: 404 });
    return;
  }

  res.json(product);
});

// GET /api/products/categories — list unique categories
productsRouter.get('/categories/list', async (_req: Request, res: Response) => {
  const products = await prisma.product.findMany({ select: { category: true }, distinct: ['category'] });
  const categories = products.map((p) => p.category);
  res.json({ data: categories });
});
