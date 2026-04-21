import type {
  AdminReview,
  CreateReviewInput,
  Product,
  Review,
  ReviewStatus,
  UpdateReviewInput,
  User,
} from '@zava/shared';

const API_BASE = '/api';
const TOKEN_KEY = 'zava_token';
const USER_KEY = 'zava_user';

export class ApiError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem(TOKEN_KEY);
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Request failed' }));
    throw new ApiError(error.message || `HTTP ${res.status}`, res.status);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

export function getCurrentUser(): User | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export function setCurrentSession(token: string, user: User): void {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearCurrentSession(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export const api = {
  // Products
  getProducts: (category?: string, search?: string) => {
    const params = new URLSearchParams();
    if (category) params.set('category', category);
    if (search) params.set('search', search);
    const qs = params.toString();
    return request<{ data: Product[]; total: number }>(qs ? `/products?${qs}` : '/products');
  },

  getProduct: (id: string) => request<Product>(`/products/${id}`),

  getCategories: () => request<{ data: string[] }>('/products/categories/list'),

  // Cart
  getCart: () => request<any>('/cart'),

  addToCart: (productId: string, quantity: number) =>
    request<any>('/cart/items', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity }),
    }),

  removeFromCart: (itemId: string) => request<void>(`/cart/items/${itemId}`, { method: 'DELETE' }),

  // Auth
  login: (email: string, password: string) =>
    request<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (email: string, password: string, name: string) =>
    request<{ token: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    }),

  // Reviews
  getReviews: (productId: string) =>
    request<{ data: Review[]; total: number }>(`/products/${productId}/reviews`),

  createReview: (productId: string, input: CreateReviewInput) =>
    request<Review>(`/products/${productId}/reviews`, {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  updateReview: (reviewId: string, input: UpdateReviewInput) =>
    request<Review>(`/reviews/${reviewId}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    }),

  deleteReview: (reviewId: string) => request<void>(`/reviews/${reviewId}`, { method: 'DELETE' }),

  // Admin reviews
  getAdminReviews: (status?: ReviewStatus) =>
    request<{ data: AdminReview[]; total: number }>(
      status ? `/admin/reviews?status=${status}` : '/admin/reviews',
    ),

  setReviewStatus: (reviewId: string, status: ReviewStatus) =>
    request<AdminReview>(`/admin/reviews/${reviewId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
};
