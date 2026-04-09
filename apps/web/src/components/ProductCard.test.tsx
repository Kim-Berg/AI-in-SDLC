import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import { ProductCard } from './ProductCard';

const product = {
  id: '1',
  name: 'Zava Espresso Blend',
  description: 'Rich dark-roast coffee',
  price: 1899,
  imageUrl: '/images/espresso.jpg',
  category: 'Coffee',
  stock: 10,
};

function renderCard() {
  return render(
    <BrowserRouter>
      <ProductCard {...product} />
    </BrowserRouter>,
  );
}

describe('ProductCard', () => {
  it('renders product name', () => {
    renderCard();
    expect(screen.getByText('Zava Espresso Blend')).toBeDefined();
  });

  it('renders formatted price', () => {
    renderCard();
    expect(screen.getByText('$18.99')).toBeDefined();
  });

  it('renders category', () => {
    renderCard();
    expect(screen.getByText('Coffee')).toBeDefined();
  });

  it('links to product detail page', () => {
    renderCard();
    const links = screen.getAllByRole('link');
    expect(links[0].getAttribute('href')).toBe('/products/1');
  });

  it('shows Add to Cart button', () => {
    renderCard();
    expect(screen.getByText('Add to Cart')).toBeDefined();
  });
});
