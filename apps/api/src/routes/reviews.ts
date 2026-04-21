import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { prisma } from '../models/prisma.js';
import { authenticate, requireAdmin, AuthenticatedRequest } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';
import { sendReviewApprovedEmail } from '../services/email.js';

export const reviewsRouter = Router();

const HTML_TAG_PATTERN = /<[a-z][\s\S]*?>/i;

const reviewTextSchema = z
  .string()
  .trim()
  .min(10)
  .max(2000)
  .refine((val) => !HTML_TAG_PATTERN.test(val), 'HTML tags are not allowed');

const createReviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  text: reviewTextSchema,
});

const updateReviewSchema = z
  .object({
    rating: z.number().int().min(1).max(5).optional(),
    text: reviewTextSchema.optional(),
  })
  .refine((data) => data.rating !== undefined || data.text !== undefined, {
    message: 'At least one of rating or text must be provided',
  });

const statusSchema = z.object({
  status: z.enum(['visible', 'hidden']),
});

type ReviewWithUser = Prisma.ReviewGetPayload<{ include: { user: { select: { name: true } } } }>;
type ReviewWithUserAndProduct = Prisma.ReviewGetPayload<{
  include: { user: { select: { name: true; email: true } }; product: { select: { name: true } } };
}>;

function serializeReview(review: ReviewWithUser) {
  return {
    id: review.id,
    productId: review.productId,
    userId: review.userId,
    userName: review.user.name,
    rating: review.rating,
    text: review.text,
    status: review.status,
    createdAt: review.createdAt,
    updatedAt: review.updatedAt,
  };
}

function serializeAdminReview(review: ReviewWithUserAndProduct) {
  return {
    ...serializeReview(review),
    productName: review.product.name,
  };
}

// GET /api/products/:productId/reviews — public, visible reviews only
reviewsRouter.get('/products/:productId/reviews', async (req: Request, res: Response) => {
  const product = await prisma.product.findUnique({ where: { id: req.params.productId } });
  if (!product) {
    res.status(404).json({ message: 'Product not found', code: 'NOT_FOUND', statusCode: 404 });
    return;
  }

  const reviews = await prisma.review.findMany({
    where: { productId: req.params.productId, status: 'visible' },
    include: { user: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
  });

  const data = reviews.map(serializeReview);
  res.json({ data, total: data.length });
});

// POST /api/products/:productId/reviews — auth required, one per user per product
reviewsRouter.post(
  '/products/:productId/reviews',
  authenticate,
  validate(createReviewSchema),
  async (req: AuthenticatedRequest, res: Response) => {
    const { rating, text } = req.body as z.infer<typeof createReviewSchema>;
    const { productId } = req.params;

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      res.status(404).json({ message: 'Product not found', code: 'NOT_FOUND', statusCode: 404 });
      return;
    }

    try {
      const review = await prisma.review.create({
        data: { productId, userId: req.userId!, rating, text },
        include: { user: { select: { name: true } } },
      });
      res.status(201).json(serializeReview(review));
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        res
          .status(409)
          .json({
            message: 'You have already reviewed this product',
            code: 'CONFLICT',
            statusCode: 409,
          });
        return;
      }
      throw err;
    }
  },
);

// PATCH /api/reviews/:id — author only
reviewsRouter.patch(
  '/reviews/:id',
  authenticate,
  validate(updateReviewSchema),
  async (req: AuthenticatedRequest, res: Response) => {
    const review = await prisma.review.findUnique({ where: { id: req.params.id } });
    if (!review) {
      res.status(404).json({ message: 'Review not found', code: 'NOT_FOUND', statusCode: 404 });
      return;
    }
    if (review.userId !== req.userId) {
      res
        .status(403)
        .json({ message: 'You can only edit your own review', code: 'FORBIDDEN', statusCode: 403 });
      return;
    }

    const { rating, text } = req.body as z.infer<typeof updateReviewSchema>;
    const updated = await prisma.review.update({
      where: { id: review.id },
      data: {
        ...(rating !== undefined ? { rating } : {}),
        ...(text !== undefined ? { text } : {}),
      },
      include: { user: { select: { name: true } } },
    });

    res.json(serializeReview(updated));
  },
);

// DELETE /api/reviews/:id — author or admin
reviewsRouter.delete(
  '/reviews/:id',
  authenticate,
  async (req: AuthenticatedRequest, res: Response) => {
    const review = await prisma.review.findUnique({ where: { id: req.params.id } });
    if (!review) {
      res.status(404).json({ message: 'Review not found', code: 'NOT_FOUND', statusCode: 404 });
      return;
    }
    if (review.userId !== req.userId && req.userRole !== 'admin') {
      res
        .status(403)
        .json({ message: 'Not allowed to delete this review', code: 'FORBIDDEN', statusCode: 403 });
      return;
    }

    await prisma.review.delete({ where: { id: review.id } });
    res.status(204).send();
  },
);

// GET /api/admin/reviews?status=visible|hidden — admin only
reviewsRouter.get(
  '/admin/reviews',
  authenticate,
  requireAdmin,
  async (req: AuthenticatedRequest, res: Response) => {
    const statusParam = typeof req.query.status === 'string' ? req.query.status : undefined;
    const where =
      statusParam === 'visible' || statusParam === 'hidden' ? { status: statusParam } : {};

    const reviews = await prisma.review.findMany({
      where,
      include: {
        user: { select: { name: true } },
        product: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const data = reviews.map(serializeAdminReview);
    res.json({ data, total: data.length });
  },
);

// PATCH /api/admin/reviews/:id/status — admin only
reviewsRouter.patch(
  '/admin/reviews/:id/status',
  authenticate,
  requireAdmin,
  validate(statusSchema),
  async (req: AuthenticatedRequest, res: Response) => {
    const { status } = req.body as z.infer<typeof statusSchema>;
    const existing = await prisma.review.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      res.status(404).json({ message: 'Review not found', code: 'NOT_FOUND', statusCode: 404 });
      return;
    }

    const updated = await prisma.review.update({
      where: { id: req.params.id },
      data: { status },
      include: {
        user: { select: { name: true, email: true } },
        product: { select: { name: true } },
      },
    });

    if (status === 'visible' && existing.status !== 'visible') {
      sendReviewApprovedEmail({
        to: updated.user.email,
        userName: updated.user.name,
        productName: updated.product.name,
      }).catch((err) => console.error('[email] Failed to send review approval email:', err));
    }

    res.json(serializeAdminReview(updated));
  },
);
