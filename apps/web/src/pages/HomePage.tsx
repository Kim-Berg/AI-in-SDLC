import { startTransition, useDeferredValue, useEffect, useState } from 'react';
import { ProductCard } from '../components/ProductCard';
import { useProducts } from '../hooks/useProducts';
import { useCart } from '../hooks/useCart';
import { api } from '../services/apiClient';

export function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [categories, setCategories] = useState<string[]>([]);
  const deferredCategory = useDeferredValue(selectedCategory === 'All' ? undefined : selectedCategory);
  const { products, loading, error } = useProducts(deferredCategory);
  const { addItem, error: cartError, demoUserName, itemCount, sessionReady } = useCart();

  useEffect(() => {
    let active = true;

    api
      .getCategories()
      .then((response) => {
        if (active) {
          setCategories(response.data);
        }
      })
      .catch(() => {
        if (active) {
          setCategories([]);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const categoryOptions = ['All', ...categories];

  const handleSelectCategory = (category: string) => {
    startTransition(() => {
      setSelectedCategory(category);
    });
  };

  return (
    <>
      <section className="hero-panel">
        <div className="hero-panel__content">
          <span className="hero-panel__eyebrow">AI in SDLC demo storefront</span>
          <h1 className="hero-panel__title">A premium catalog shaped for Copilot demos, not placeholder scaffolding.</h1>
          <p className="hero-panel__copy">
            Zava now reads like a high-end retail experience: coffee blends, brewing gear, and lifestyle accessories with curated presentation, seeded demo identity, and a live cart session.
          </p>
          <div className="hero-panel__stats">
            <div className="stat-card">
              <span className="stat-card__value">8</span>
              <span className="stat-card__label">premium SKUs</span>
            </div>
            <div className="stat-card">
              <span className="stat-card__value">{itemCount}</span>
              <span className="stat-card__label">items in demo cart</span>
            </div>
            <div className="stat-card">
              <span className="stat-card__value">{sessionReady ? demoUserName ?? 'Ready' : 'Syncing'}</span>
              <span className="stat-card__label">active demo shopper</span>
            </div>
          </div>
        </div>
        <div className="hero-panel__aside">
          <div className="hero-note">
            <span className="hero-note__label">Collections</span>
            <p>Blend discovery, barista equipment, and hospitality accessories in one richer storefront narrative.</p>
          </div>
          <div className="hero-note">
            <span className="hero-note__label">Demo flow</span>
            <p>Plan reviews, build moderation, inspect security, then hand off wishlist and search to Copilot.</p>
          </div>
        </div>
      </section>

      <section className="catalog-shell">
        <div className="catalog-shell__header">
          <div>
            <h2 className="page-title">Curated Collections</h2>
            <p className="catalog-shell__copy">Filter by merchandising lane while keeping the demo narrative anchored in retail quality.</p>
          </div>
          <div className="category-filter" role="tablist" aria-label="Filter products by category">
            {categoryOptions.map((category) => (
              <button
                key={category}
                className={`category-filter__chip${selectedCategory === category ? ' category-filter__chip--active' : ''}`}
                onClick={() => {
                  handleSelectCategory(category);
                }}
                type="button"
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {loading ? <div className="loading">Loading products...</div> : null}
        {error ? <div className="empty-state">Error: {error}</div> : null}
        {cartError ? <div className="empty-state">Cart error: {cartError}</div> : null}

        {!loading && !error ? (
          <div className="product-grid">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                description={product.description}
                price={product.price}
                imageUrl={product.imageUrl}
                category={product.category}
                onAddToCart={() => {
                  void addItem(product.id, 1);
                }}
              />
            ))}
          </div>
        ) : null}

        {!loading && !error && products.length === 0 ? <div className="empty-state">No products available.</div> : null}
      </section>
    </>
  );
}
