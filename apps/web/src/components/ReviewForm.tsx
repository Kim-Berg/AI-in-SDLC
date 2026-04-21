import { FormEvent, useEffect, useState } from 'react';
import type { Review } from '@zava/shared';
import { StarRating } from './StarRating';

interface ReviewFormProps {
  initialReview?: Review | null;
  onSubmit: (input: { rating: number; text: string }) => Promise<void>;
  onCancel?: () => void;
}

export function ReviewForm({ initialReview, onSubmit, onCancel }: ReviewFormProps) {
  const [rating, setRating] = useState(initialReview?.rating ?? 0);
  const [text, setText] = useState(initialReview?.text ?? '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setRating(initialReview?.rating ?? 0);
    setText(initialReview?.text ?? '');
  }, [initialReview]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    if (rating < 1 || rating > 5) {
      setError('Please select a rating between 1 and 5 stars.');
      return;
    }
    if (text.trim().length === 0) {
      setError('Please write a short review.');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({ rating, text: text.trim() });
      if (!initialReview) {
        setRating(0);
        setText('');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="review-form" onSubmit={handleSubmit} aria-label="Write a review">
      <div className="review-form__row">
        <label className="review-form__label" id="review-rating-label">
          Your rating
        </label>
        <StarRating value={rating} onChange={setRating} size="md" label="Your rating" />
      </div>
      <div className="review-form__row">
        <label className="review-form__label" htmlFor="review-text">
          Your review
        </label>
        <textarea
          id="review-text"
          className="review-form__textarea"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          maxLength={2000}
          placeholder="What did you think?"
        />
      </div>
      {error ? <p className="review-form__error">{error}</p> : null}
      <div className="review-form__actions">
        <button type="submit" className="btn btn--primary" disabled={submitting}>
          {submitting ? 'Saving…' : initialReview ? 'Update review' : 'Submit review'}
        </button>
        {onCancel ? (
          <button type="button" className="btn btn--ghost" onClick={onCancel} disabled={submitting}>
            Cancel
          </button>
        ) : null}
      </div>
    </form>
  );
}
