import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import { Header } from './Header';

describe('Header', () => {
  it('renders ZAVA logo', () => {
    render(
      <BrowserRouter>
        <Header cartItemCount={0} />
      </BrowserRouter>,
    );
    expect(screen.getByText('ZAVA')).toBeDefined();
  });

  it('renders Shop link', () => {
    render(
      <BrowserRouter>
        <Header cartItemCount={0} />
      </BrowserRouter>,
    );
    expect(screen.getByText('Shop')).toBeDefined();
  });

  it('shows cart count when non-zero', () => {
    render(
      <BrowserRouter>
        <Header cartItemCount={3} />
      </BrowserRouter>,
    );
    expect(screen.getByText('3')).toBeDefined();
  });

  it('hides cart badge when count is zero', () => {
    render(
      <BrowserRouter>
        <Header cartItemCount={0} />
      </BrowserRouter>,
    );
    expect(screen.queryByText('0')).toBeNull();
  });
});
