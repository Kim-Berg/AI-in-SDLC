import { Link } from 'react-router-dom';
import { formatPrice } from '@zava/shared';
import type { ProductRatingSummary } from '@zava/shared';
import { StarRating } from './StarRating';

interface ProductCardProps {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  rating?: ProductRatingSummary;
  onAddToCart?: () => void;
}

export function ProductCard({
  id,
  name,
  description,
  price,
  imageUrl,
  category,
  rating,
  onAddToCart,
}: ProductCardProps) {
  return (
    <div className="product-card">
      <div className="product-card__media">
        <Link to={`/products/${id}`}>
          <img className="product-card__image" src={imageUrl} alt={name} loading="lazy" />
        </Link>
        <div className="product-card__topline">
          <span className="product-card__category">{category}</span>
          <span className="product-card__label">Curated</span>
        </div>
      </div>
      <div className="product-card__body">
        <Link to={`/products/${id}`}>
          <h3 className="product-card__name">{name}</h3>
        </Link>
        <p className="product-card__description">{description}</p>
        <p className="product-card__price">{formatPrice(price)}</p>
        {rating && rating.count > 0 ? (
          <div className="product-card__rating" data-testid="product-card-rating">
            <StarRating value={rating.average} readOnly size="sm" />
            <span className="product-card__rating-value">{rating.average.toFixed(1)}</span>
            <span className="product-card__rating-count">({rating.count})</span>
          </div>
        ) : null}
      </div>
      <div className="product-card__actions">
        <button className="btn btn--primary btn--full" onClick={onAddToCart}>
          Add to Cart
        </button>
      </div>
    </div>
  );
}
