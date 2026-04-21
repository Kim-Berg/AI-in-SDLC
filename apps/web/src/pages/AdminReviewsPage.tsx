import { useCallback, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import type { AdminReview, ReviewStatus } from '@zava/shared';
import { api, getCurrentUser } from '../services/apiClient';
import { StarRating } from '../components/StarRating';

type Filter = 'all' | ReviewStatus;

export function AdminReviewsPage() {
  const user = getCurrentUser();
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [filter, setFilter] = useState<Filter>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getAdminReviews(filter === 'all' ? undefined : filter);
      setReviews(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    if (user?.role === 'admin') {
      void load();
    }
  }, [load, user]);

  if (!user || user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  const toggleStatus = async (review: AdminReview) => {
    const next: ReviewStatus = review.status === 'visible' ? 'hidden' : 'visible';
    await api.setReviewStatus(review.id, next);
    await load();
  };

  const removeReview = async (review: AdminReview) => {
    if (!window.confirm(`Delete this review from ${review.userName}? This cannot be undone.`))
      return;
    await api.deleteReview(review.id);
    await load();
  };

  const filters: { value: Filter; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'visible', label: 'Visible' },
    { value: 'hidden', label: 'Hidden' },
  ];

  return (
    <div className="admin-page">
      <header className="admin-page__header">
        <h1 className="page-title">Review moderation</h1>
        <p>Hide reviews that violate policy. Visible reviews count toward product ratings.</p>
      </header>

      <div className="admin-filters" role="tablist" aria-label="Filter reviews by status">
        {filters.map((f) => (
          <button
            key={f.value}
            type="button"
            className={`category-filter__chip${filter === f.value ? ' category-filter__chip--active' : ''}`}
            onClick={() => setFilter(f.value)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? <div className="loading">Loading reviews…</div> : null}
      {error ? <div className="empty-state">Error: {error}</div> : null}

      {!loading && !error ? (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Author</th>
              <th>Rating</th>
              <th>Review</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {reviews.length === 0 ? (
              <tr>
                <td colSpan={6} className="admin-table__empty">
                  No reviews to show.
                </td>
              </tr>
            ) : (
              reviews.map((r) => (
                <tr key={r.id} data-testid="admin-review-row">
                  <td>{r.productName}</td>
                  <td>{r.userName}</td>
                  <td>
                    <StarRating value={r.rating} readOnly size="sm" />
                  </td>
                  <td className="admin-table__text">{r.text}</td>
                  <td>
                    <span className={`status-pill status-pill--${r.status}`}>{r.status}</span>
                  </td>
                  <td className="admin-table__actions">
                    <button
                      type="button"
                      className="btn btn--ghost btn--sm"
                      onClick={() => toggleStatus(r)}
                    >
                      {r.status === 'visible' ? 'Hide' : 'Restore'}
                    </button>
                    <button
                      type="button"
                      className="btn btn--ghost btn--sm"
                      onClick={() => removeReview(r)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      ) : null}
    </div>
  );
}
