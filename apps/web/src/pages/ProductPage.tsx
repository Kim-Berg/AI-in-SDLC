import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { formatPrice } from '@zava/shared';
import { api } from '../services/apiClient';

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

  useEffect(() => {
    if (!id) return;
    api.getProduct(id).then(setProduct).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="loading">Loading...</div>;
  if (!product) return <div className="empty-state">Product not found</div>;

  return (
    <div>
      <Link to="/" style={{ marginBottom: '1rem', display: 'inline-block' }}>
        ← Back to Shop
      </Link>
      <div style={{ display: 'flex', gap: '2rem', marginTop: '1rem' }}>
        <img
          src={product.imageUrl}
          alt={product.name}
          style={{ width: 400, height: 400, objectFit: 'cover', borderRadius: 'var(--radius)' }}
        />
        <div>
          <span className="product-card__category">{product.category}</span>
          <h1 className="page-title" style={{ marginTop: '0.5rem' }}>
            {product.name}
          </h1>
          <p className="product-card__price" style={{ fontSize: '1.5rem', margin: '1rem 0' }}>
            {formatPrice(product.price)}
          </p>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>{product.description}</p>
          <p style={{ marginBottom: '1rem' }}>
            {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
          </p>
          <button className="btn btn--primary" disabled={product.stock === 0}>
            Add to Cart
          </button>

          {/* Product reviews section will be added here during Demo 2 */}
        </div>
      </div>
    </div>
  );
}
