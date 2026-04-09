import { Link } from 'react-router-dom';
import { formatPrice } from '@zava/shared';
import { useCart } from '../hooks/useCart';
import { CartItemRow } from '../components/CartItemRow';

export function CartPage() {
  const { cart, loading, removeItem } = useCart();

  if (loading) return <div className="loading">Loading cart...</div>;

  const items = cart?.items ?? [];
  const total = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

  return (
    <div>
      <h1 className="page-title">Your Cart</h1>

      {items.length === 0 ? (
        <div className="empty-state">
          <p>Your cart is empty.</p>
          <Link to="/" className="btn btn--primary" style={{ marginTop: '1rem', display: 'inline-block' }}>
            Continue Shopping
          </Link>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {items.map((item) => (
              <CartItemRow key={item.id} item={item} onRemove={() => removeItem(item.id)} />
            ))}
          </div>

          <div
            style={{
              marginTop: '2rem',
              padding: '1.5rem',
              background: 'var(--color-surface)',
              borderRadius: 'var(--radius)',
              border: '1px solid var(--color-border)',
              maxWidth: 400,
              marginLeft: 'auto',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <span>Subtotal ({items.length} items)</span>
              <strong>{formatPrice(total)}</strong>
            </div>
            <button className="btn btn--primary" style={{ width: '100%' }}>
              Checkout
            </button>

            {/* Discount code field will be added here during Demo 3 */}
          </div>
        </>
      )}
    </div>
  );
}
