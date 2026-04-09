import { Link } from 'react-router-dom';

interface HeaderProps {
  cartItemCount: number;
}

export function Header({ cartItemCount }: HeaderProps) {
  return (
    <header className="header">
      <div className="header__brand">
        <Link to="/" className="header__logo">
          ZAVA
        </Link>
        <p className="header__tagline">Premium coffee, brewing gear, and lifestyle essentials.</p>
      </div>
      <div className="header__actions">
        <nav className="header__nav">
          <Link to="/">Shop</Link>
          <Link to="/cart">
            Cart
            {cartItemCount > 0 && <span className="header__cart-badge">{cartItemCount}</span>}
          </Link>
        </nav>
      </div>
    </header>
  );
}
