import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { formatPrice } from '@zava/shared';
import { api } from '../services/apiClient';
import { useCart } from '../hooks/useCart';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  stock: number;
}

export function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();

  useEffect(() => {
    if (!id) return;
    api.getProduct(id).then(setProduct).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="loading">Loading...</div>;
  if (!product) return <div className="empty-state">Product not found</div>;

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
          <p className="product-card__price product-detail__price">{formatPrice(product.price)}</p>
          <p className="product-detail__description">{product.description}</p>
          <p className="product-detail__stock">{product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}</p>
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
    </div>
  );
}
