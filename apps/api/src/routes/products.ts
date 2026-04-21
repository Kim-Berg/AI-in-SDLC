import { Router, Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { prisma } from '../models/prisma.js';

export const productsRouter = Router();

interface RatingAggregate {
  average: number;
  count: number;
}

async function getRatingMap(productIds: string[]): Promise<Map<string, RatingAggregate>> {
  if (productIds.length === 0) return new Map();
  const grouped = await prisma.review.groupBy({
    by: ['productId'],
    where: { productId: { in: productIds }, status: 'visible' },
    _avg: { rating: true },
    _count: { _all: true },
  });
  const map = new Map<string, RatingAggregate>();
  for (const row of grouped) {
    map.set(row.productId, {
      average: row._avg.rating ? Math.round(row._avg.rating * 10) / 10 : 0,
      count: row._count._all,
    });
  }
  return map;
}

function withRating<T extends { id: string }>(
  product: T,
  map: Map<string, RatingAggregate>,
): T & { rating: RatingAggregate } {
  return { ...product, rating: map.get(product.id) ?? { average: 0, count: 0 } };
}

// GET /api/products — list all products
productsRouter.get('/', async (req: Request, res: Response) => {
  const { category, search } = req.query;

  const where: Prisma.ProductWhereInput = {};
  if (category) {
    where.category = String(category);
  }
  const searchTerm = typeof search === 'string' ? search.trim() : '';
  if (searchTerm) {
    where.OR = [{ name: { contains: searchTerm } }, { description: { contains: searchTerm } }];
  }

  const products = await prisma.product.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });

  const ratings = await getRatingMap(products.map((p) => p.id));
  const data = products.map((p) => withRating(p, ratings));
  res.json({ data, total: data.length });
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

  const ratings = await getRatingMap([product.id]);
  res.json(withRating(product, ratings));
});

// GET /api/products/categories — list unique categories
productsRouter.get('/categories/list', async (_req: Request, res: Response) => {
  const products = await prisma.product.findMany({
    select: { category: true },
    distinct: ['category'],
  });
  const categories = products.map((p) => p.category);
  res.json({ data: categories });
});
