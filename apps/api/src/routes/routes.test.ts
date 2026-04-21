import { describe, it, expect, beforeAll, afterAll, vi, afterEach } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';
import { prisma } from '../models/prisma.js';

vi.mock('../services/email.js', () => ({
  sendReviewApprovedEmail: vi.fn().mockResolvedValue(undefined),
}));

import { sendReviewApprovedEmail } from '../services/email.js';

describe('GET /api/health', () => {
  it('returns ok status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.service).toBe('zava-api');
  });
});

describe('Products API', () => {
  beforeAll(async () => {
    await prisma.cartItem.deleteMany();
    await prisma.cart.deleteMany();
    await prisma.product.deleteMany();
    await prisma.product.createMany({
      data: [
        {
          name: 'Test Sneakers',
          description: 'Test shoes',
          price: 9999,
          imageUrl: 'https://example.com/shoe.jpg',
          category: 'Footwear',
          stock: 10,
        },
        {
          name: 'Test Jacket',
          description: 'Test jacket',
          price: 14999,
          imageUrl: 'https://example.com/jacket.jpg',
          category: 'Outerwear',
          stock: 5,
        },
        {
          name: 'Test Hat',
          description: 'Test hat',
          price: 2499,
          imageUrl: 'https://example.com/hat.jpg',
          category: 'Accessories',
          stock: 20,
        },
      ],
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('GET /api/products returns all products', async () => {
    const res = await request(app).get('/api/products');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(3);
    expect(res.body.total).toBe(3);
  });

  it('GET /api/products?category=Footwear filters by category', async () => {
    const res = await request(app).get('/api/products?category=Footwear');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].name).toBe('Test Sneakers');
  });

  it('GET /api/products/:id returns a single product', async () => {
    const all = await request(app).get('/api/products');
    const id = all.body.data[0].id;

    const res = await request(app).get(`/api/products/${id}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(id);
  });

  it('GET /api/products/:id returns 404 for missing product', async () => {
    const res = await request(app).get('/api/products/nonexistent-id');
    expect(res.status).toBe(404);
    expect(res.body.code).toBe('NOT_FOUND');
  });

  it('GET /api/products/categories/list returns unique categories', async () => {
    const res = await request(app).get('/api/products/categories/list');
    expect(res.status).toBe(200);
    expect(res.body.data).toContain('Footwear');
    expect(res.body.data).toContain('Outerwear');
    expect(res.body.data).toContain('Accessories');
  });
});

describe('Auth API', () => {
  beforeAll(async () => {
    await prisma.cartItem.deleteMany();
    await prisma.cart.deleteMany();
    await prisma.user.deleteMany();
  });

  it('POST /api/auth/register creates a new user', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: 'test@zava.com',
      password: 'TestPass123',
      name: 'Test User',
    });
    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe('test@zava.com');
  });

  it('POST /api/auth/register rejects duplicate email', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: 'test@zava.com',
      password: 'TestPass123',
      name: 'Test User 2',
    });
    expect(res.status).toBe(409);
  });

  it('POST /api/auth/login returns token for valid credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'test@zava.com',
      password: 'TestPass123',
    });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  it('POST /api/auth/login rejects invalid password', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'test@zava.com',
      password: 'WrongPassword',
    });
    expect(res.status).toBe(401);
  });

  it('POST /api/auth/register validates input', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: 'not-an-email',
      password: 'short',
      name: '',
    });
    expect(res.status).toBe(400);
    expect(res.body.code).toBe('VALIDATION_ERROR');
  });
});

describe('Cart API', () => {
  let token: string;
  let productId: string;

  beforeAll(async () => {
    // Register a user and get a token
    const regRes = await request(app).post('/api/auth/register').send({
      email: 'cart-user@zava.com',
      password: 'CartPass123',
      name: 'Cart Tester',
    });
    token = regRes.body.token;

    // Get a product ID
    const prodRes = await request(app).get('/api/products');
    productId = prodRes.body.data[0].id;
  });

  it('GET /api/cart requires auth', async () => {
    const res = await request(app).get('/api/cart');
    expect(res.status).toBe(401);
  });

  it('GET /api/cart returns empty cart for new user', async () => {
    const res = await request(app).get('/api/cart').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.items).toHaveLength(0);
    expect(res.body.total).toBe(0);
  });

  it('POST /api/cart/items adds an item to the cart', async () => {
    const res = await request(app)
      .post('/api/cart/items')
      .set('Authorization', `Bearer ${token}`)
      .send({ productId, quantity: 2 });
    expect(res.status).toBe(200);
    expect(res.body.items).toHaveLength(1);
    expect(res.body.items[0].quantity).toBe(2);
    expect(res.body.total).toBeGreaterThan(0);
  });

  it('POST /api/cart/items increments quantity for existing item', async () => {
    const res = await request(app)
      .post('/api/cart/items')
      .set('Authorization', `Bearer ${token}`)
      .send({ productId, quantity: 1 });
    expect(res.status).toBe(200);
    expect(res.body.items[0].quantity).toBe(3);
  });

  it('DELETE /api/cart/items/:itemId removes item', async () => {
    const cart = await request(app).get('/api/cart').set('Authorization', `Bearer ${token}`);
    const itemId = cart.body.items[0].id;

    const res = await request(app)
      .delete(`/api/cart/items/${itemId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(204);
  });
});

describe('Reviews API', () => {
  let customerToken: string;
  let otherToken: string;
  let adminToken: string;
  let productId: string;
  let otherProductId: string;

  beforeAll(async () => {
    await prisma.review.deleteMany();

    const custRes = await request(app).post('/api/auth/register').send({
      email: 'review-customer@zava.com',
      password: 'ReviewPass123',
      name: 'Review Customer',
    });
    customerToken = custRes.body.token;

    const otherRes = await request(app).post('/api/auth/register').send({
      email: 'review-other@zava.com',
      password: 'ReviewPass123',
      name: 'Other Reviewer',
    });
    otherToken = otherRes.body.token;

    const adminRes = await request(app).post('/api/auth/register').send({
      email: 'review-admin@zava.com',
      password: 'ReviewPass123',
      name: 'Review Admin',
    });
    await prisma.user.update({
      where: { email: 'review-admin@zava.com' },
      data: { role: 'admin' },
    });
    // Re-login so the token carries the admin role claim
    const adminLogin = await request(app).post('/api/auth/login').send({
      email: 'review-admin@zava.com',
      password: 'ReviewPass123',
    });
    adminToken = adminLogin.body.token;
    expect(adminRes.status).toBe(201);

    const prods = await request(app).get('/api/products');
    productId = prods.body.data[0].id;
    otherProductId = prods.body.data[1].id;
  });

  it('POST /api/products/:id/reviews requires auth', async () => {
    const res = await request(app)
      .post(`/api/products/${productId}/reviews`)
      .send({ rating: 5, text: 'Great' });
    expect(res.status).toBe(401);
  });

  it('POST /api/products/:id/reviews rejects invalid ratings', async () => {
    for (const bad of [0, 6, 3.5]) {
      const res = await request(app)
        .post(`/api/products/${productId}/reviews`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ rating: bad, text: 'This is a valid review text' });
      expect(res.status).toBe(400);
      expect(res.body.code).toBe('VALIDATION_ERROR');
    }
  });

  it('POST /api/products/:id/reviews rejects empty text', async () => {
    const res = await request(app)
      .post(`/api/products/${productId}/reviews`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ rating: 4, text: '   ' });
    expect(res.status).toBe(400);
  });

  it('POST /api/products/:id/reviews rejects text shorter than 10 characters', async () => {
    const res = await request(app)
      .post(`/api/products/${productId}/reviews`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ rating: 4, text: 'Too short' });
    expect(res.status).toBe(400);
    expect(res.body.code).toBe('VALIDATION_ERROR');
  });

  it('POST /api/products/:id/reviews rejects text containing HTML tags', async () => {
    const res = await request(app)
      .post(`/api/products/${productId}/reviews`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ rating: 4, text: 'This is a <script>alert("xss")</script> review text' });
    expect(res.status).toBe(400);
    expect(res.body.code).toBe('VALIDATION_ERROR');
  });

  it('POST /api/products/:id/reviews rejects text with HTML img tag', async () => {
    const res = await request(app)
      .post(`/api/products/${productId}/reviews`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ rating: 4, text: 'Check out this <img src=x onerror=alert(1)> cool product' });
    expect(res.status).toBe(400);
    expect(res.body.code).toBe('VALIDATION_ERROR');
  });

  it('POST /api/products/:id/reviews returns 404 for missing product', async () => {
    const res = await request(app)
      .post('/api/products/does-not-exist/reviews')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ rating: 5, text: 'Nice product review' });
    expect(res.status).toBe(404);
  });

  it('POST /api/products/:id/reviews creates a review', async () => {
    const res = await request(app)
      .post(`/api/products/${productId}/reviews`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ rating: 4, text: 'Solid product, happy with it.' });
    expect(res.status).toBe(201);
    expect(res.body.rating).toBe(4);
    expect(res.body.userName).toBe('Review Customer');
    expect(res.body.status).toBe('visible');
  });

  it('POST /api/products/:id/reviews rejects a duplicate from the same user', async () => {
    const res = await request(app)
      .post(`/api/products/${productId}/reviews`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ rating: 5, text: 'Trying again' });
    expect(res.status).toBe(409);
    expect(res.body.code).toBe('CONFLICT');
  });

  it('GET /api/products/:id/reviews returns visible reviews', async () => {
    const res = await request(app).get(`/api/products/${productId}/reviews`);
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(1);
    expect(res.body.data[0].rating).toBe(4);
  });

  it('GET /api/products includes rating aggregate', async () => {
    // Add another review from other user so the average is 4.5
    await request(app)
      .post(`/api/products/${productId}/reviews`)
      .set('Authorization', `Bearer ${otherToken}`)
      .send({ rating: 5, text: 'Love it so much!' });

    const res = await request(app).get('/api/products');
    const prod = res.body.data.find((p: { id: string }) => p.id === productId);
    expect(prod.rating).toEqual({ average: 4.5, count: 2 });

    const other = res.body.data.find((p: { id: string }) => p.id === otherProductId);
    expect(other.rating).toEqual({ average: 0, count: 0 });
  });

  it('PATCH /api/reviews/:id allows author to edit', async () => {
    const list = await request(app).get(`/api/products/${productId}/reviews`);
    const mine = list.body.data.find((r: { userName: string }) => r.userName === 'Review Customer');

    const res = await request(app)
      .patch(`/api/reviews/${mine.id}`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ rating: 3 });
    expect(res.status).toBe(200);
    expect(res.body.rating).toBe(3);
  });

  it('PATCH /api/reviews/:id forbids non-authors', async () => {
    const list = await request(app).get(`/api/products/${productId}/reviews`);
    const mine = list.body.data.find((r: { userName: string }) => r.userName === 'Review Customer');

    const res = await request(app)
      .patch(`/api/reviews/${mine.id}`)
      .set('Authorization', `Bearer ${otherToken}`)
      .send({ rating: 1 });
    expect(res.status).toBe(403);
  });

  it('GET /api/admin/reviews requires admin role', async () => {
    const unauthed = await request(app).get('/api/admin/reviews');
    expect(unauthed.status).toBe(401);

    const asCustomer = await request(app)
      .get('/api/admin/reviews')
      .set('Authorization', `Bearer ${customerToken}`);
    expect(asCustomer.status).toBe(403);
    expect(asCustomer.body.code).toBe('FORBIDDEN');

    const asAdmin = await request(app)
      .get('/api/admin/reviews')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(asAdmin.status).toBe(200);
    expect(asAdmin.body.total).toBeGreaterThanOrEqual(2);
    expect(asAdmin.body.data[0].productName).toBeDefined();
  });

  it('PATCH /api/admin/reviews/:id/status hides a review and excludes it from aggregates', async () => {
    const list = await request(app).get(`/api/products/${productId}/reviews`);
    const target = list.body.data[0];

    const res = await request(app)
      .patch(`/api/admin/reviews/${target.id}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'hidden' });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('hidden');

    const publicList = await request(app).get(`/api/products/${productId}/reviews`);
    expect(publicList.body.total).toBe(1);

    const prods = await request(app).get('/api/products');
    const prod = prods.body.data.find((p: { id: string }) => p.id === productId);
    expect(prod.rating.count).toBe(1);
  });

  it('DELETE /api/reviews/:id allows admin to remove', async () => {
    const adminList = await request(app)
      .get('/api/admin/reviews')
      .set('Authorization', `Bearer ${adminToken}`);
    const target = adminList.body.data.find(
      (r: { productId: string }) => r.productId === productId,
    );

    const res = await request(app)
      .delete(`/api/reviews/${target.id}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(204);
  });
});

describe('Review approval email notification', () => {
  let customerToken: string;
  let adminToken: string;
  let productId: string;
  let reviewId: string;

  beforeAll(async () => {
    await prisma.review.deleteMany();

    const custRes = await request(app).post('/api/auth/register').send({
      email: 'email-notify-customer@zava.com',
      password: 'NotifyPass123',
      name: 'Notify Customer',
    });
    customerToken = custRes.body.token;

    await request(app).post('/api/auth/register').send({
      email: 'email-notify-admin@zava.com',
      password: 'NotifyPass123',
      name: 'Notify Admin',
    });
    await prisma.user.update({
      where: { email: 'email-notify-admin@zava.com' },
      data: { role: 'admin' },
    });
    const adminLogin = await request(app).post('/api/auth/login').send({
      email: 'email-notify-admin@zava.com',
      password: 'NotifyPass123',
    });
    adminToken = adminLogin.body.token;

    const prods = await request(app).get('/api/products');
    productId = prods.body.data[0].id;

    const reviewRes = await request(app)
      .post(`/api/products/${productId}/reviews`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ rating: 5, text: 'Absolutely love this product!' });
    reviewId = reviewRes.body.id;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('sends an email when a hidden review is approved', async () => {
    // First hide the review
    await request(app)
      .patch(`/api/admin/reviews/${reviewId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'hidden' });

    vi.clearAllMocks();

    // Now approve it
    const res = await request(app)
      .patch(`/api/admin/reviews/${reviewId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'visible' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('visible');
    expect(sendReviewApprovedEmail).toHaveBeenCalledOnce();
    expect(sendReviewApprovedEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'email-notify-customer@zava.com',
        userName: 'Notify Customer',
      }),
    );
  });

  it('does not send an email when a review is hidden', async () => {
    vi.clearAllMocks();

    const res = await request(app)
      .patch(`/api/admin/reviews/${reviewId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'hidden' });

    expect(res.status).toBe(200);
    expect(sendReviewApprovedEmail).not.toHaveBeenCalled();
  });

  it('does not send an email when an already-visible review is set to visible again', async () => {
    // Approve first
    await request(app)
      .patch(`/api/admin/reviews/${reviewId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'visible' });

    vi.clearAllMocks();

    // Set visible again — no email expected
    const res = await request(app)
      .patch(`/api/admin/reviews/${reviewId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'visible' });

    expect(res.status).toBe(200);
    expect(sendReviewApprovedEmail).not.toHaveBeenCalled();
  });
});
