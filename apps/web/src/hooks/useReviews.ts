import { useCallback, useEffect, useState } from 'react';
import type { CreateReviewInput, Review, UpdateReviewInput } from '@zava/shared';
import { api, getCurrentUser } from '../services/apiClient';

export function useReviews(productId: string | undefined) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const currentUser = getCurrentUser();

  const fetchReviews = useCallback(async () => {
    if (!productId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.getReviews(productId);
      setReviews(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    void fetchReviews();
  }, [fetchReviews]);

  const submit = useCallback(
    async (input: CreateReviewInput) => {
      if (!productId) return;
      await api.createReview(productId, input);
      await fetchReviews();
    },
    [productId, fetchReviews],
  );

  const update = useCallback(
    async (reviewId: string, input: UpdateReviewInput) => {
      await api.updateReview(reviewId, input);
      await fetchReviews();
    },
    [fetchReviews],
  );

  const remove = useCallback(
    async (reviewId: string) => {
      await api.deleteReview(reviewId);
      await fetchReviews();
    },
    [fetchReviews],
  );

  const myReview = currentUser ? (reviews.find((r) => r.userId === currentUser.id) ?? null) : null;

  return {
    reviews,
    loading,
    error,
    refetch: fetchReviews,
    submit,
    update,
    remove,
    myReview,
    currentUser,
  };
}
