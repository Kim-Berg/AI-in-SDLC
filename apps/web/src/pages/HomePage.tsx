import { useProducts } from '../hooks/useProducts';
import { ProductCard } from '../components/ProductCard';

export function HomePage() {
  const { products, loading, error } = useProducts();

  if (loading) return <div className="loading">Loading products...</div>;
  if (error) return <div className="empty-state">Error: {error}</div>;

  return (
    <>
      <h1 className="page-title">Shop the Latest</h1>
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
          />
        ))}
      </div>
      {products.length === 0 && <div className="empty-state">No products available.</div>}
    </>
  );
}
