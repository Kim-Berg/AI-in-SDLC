import { Link } from 'react-router-dom';
import { formatPrice } from '@zava/shared';

interface ProductCardProps {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  onAddToCart?: () => void;
}

export function ProductCard({ id, name, description, price, imageUrl, category, onAddToCart }: ProductCardProps) {
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
      </div>
      <div className="product-card__actions">
        <button className="btn btn--primary btn--full" onClick={onAddToCart}>
          Add to Cart
        </button>
      </div>
    </div>
  );
}
