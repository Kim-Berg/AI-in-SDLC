import type { Review } from '@zava/shared';
import { StarRating } from './StarRating';

interface ReviewListProps {
  reviews: Review[];
  currentUserId?: string;
  onEdit?: (review: Review) => void;
  onDelete?: (review: Review) => void;
}

function formatDate(value: Date | string): string {
  const date = typeof value === 'string' ? new Date(value) : value;
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export function ReviewList({ reviews, currentUserId, onEdit, onDelete }: ReviewListProps) {
  if (reviews.length === 0) {
    return (
      <p className="review-list__empty">No reviews yet. Be the first to share your thoughts.</p>
    );
  }

  return (
    <ul className="review-list">
      {reviews.map((review) => {
        const isMine = currentUserId && review.userId === currentUserId;
        return (
          <li key={review.id} className="review-list__item" data-testid="review-item">
            <div className="review-list__header">
              <StarRating value={review.rating} readOnly size="sm" />
              <span className="review-list__author">{review.userName}</span>
              <span className="review-list__date">{formatDate(review.createdAt)}</span>
            </div>
            <p className="review-list__text">{review.text}</p>
            {isMine ? (
              <div className="review-list__actions">
                {onEdit ? (
                  <button
                    type="button"
                    className="btn btn--ghost btn--sm"
                    onClick={() => onEdit(review)}
                  >
                    Edit
                  </button>
                ) : null}
                {onDelete ? (
                  <button
                    type="button"
                    className="btn btn--ghost btn--sm"
                    onClick={() => onDelete(review)}
                  >
                    Delete
                  </button>
                ) : null}
              </div>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
