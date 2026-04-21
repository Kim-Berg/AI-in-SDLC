import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { formatPrice } from '@zava/shared';
import type { Product, Review } from '@zava/shared';
import { api } from '../services/apiClient';
import { useCart } from '../hooks/useCart';
import { useReviews } from '../hooks/useReviews';
import { StarRating } from '../components/StarRating';
import { ReviewForm } from '../components/ReviewForm';
import { ReviewList } from '../components/ReviewList';

export function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();
  const {
    reviews,
    loading: reviewsLoading,
    submit,
    update,
    remove,
    myReview,
    currentUser,
  } = useReviews(id);
  const [editing, setEditing] = useState<Review | null>(null);

  useEffect(() => {
    if (!id) return;
    api
      .getProduct(id)
      .then(setProduct)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="loading">Loading...</div>;
  if (!product) return <div className="empty-state">Product not found</div>;

  const rating = product.rating ?? { average: 0, count: 0 };

  return (
    <div className="product-detail">
      <Link to="/" className="product-detail__backlink">
        ← Back to Shop
      </Link>
      <div className="product-detail__layout">
        <img src={product.imageUrl} alt={product.name} className="product-detail__image" />
        <div className="product-detail__content">
          <span className="product-card__category">{product.category}</span>
          <h1 className="page-title product-detail__title">{product.name}</h1>
          {rating.count > 0 ? (
            <div className="product-detail__rating">
              <StarRating value={rating.average} readOnly size="md" />
              <span className="product-detail__rating-value">{rating.average.toFixed(1)}</span>
              <span className="product-detail__rating-count">
                ({rating.count} review{rating.count === 1 ? '' : 's'})
              </span>
            </div>
          ) : null}
          <p className="product-card__price product-detail__price">{formatPrice(product.price)}</p>
          <p className="product-detail__description">{product.description}</p>
          <p className="product-detail__stock">
            {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
          </p>
          <button
            className="btn btn--primary"
            disabled={product.stock === 0}
            onClick={() => {
              void addItem(product.id, 1);
            }}
          >
            Add to Cart
          </button>
        </div>
      </div>

      <section className="product-reviews" aria-labelledby="product-reviews-heading">
        <h2 id="product-reviews-heading" className="product-reviews__title">
          Customer reviews
        </h2>

        {currentUser ? (
          editing ? (
            <ReviewForm
              initialReview={editing}
              onSubmit={async (input) => {
                await update(editing.id, input);
                setEditing(null);
              }}
              onCancel={() => setEditing(null)}
            />
          ) : myReview ? (
            <p className="product-reviews__note">
              Thanks for your review. Use the Edit button below to make changes.
            </p>
          ) : (
            <ReviewForm
              onSubmit={async (input) => {
                await submit(input);
              }}
            />
          )
        ) : (
          <p className="product-reviews__note">Sign in to leave a review.</p>
        )}

        {reviewsLoading ? (
          <div className="loading">Loading reviews...</div>
        ) : (
          <ReviewList
            reviews={reviews}
            currentUserId={currentUser?.id}
            onEdit={(review) => setEditing(review)}
            onDelete={async (review) => {
              await remove(review.id);
            }}
          />
        )}
      </section>
    </div>
  );
}
