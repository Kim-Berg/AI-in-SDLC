import { Link } from 'react-router-dom';

interface HeaderProps {
  cartItemCount: number;
  demoUserName?: string | null;
}

export function Header({ cartItemCount, demoUserName }: HeaderProps) {
  return (
    <header className="header">
      <div className="header__brand">
        <Link to="/" className="header__logo">
          ZAVA
        </Link>
        <p className="header__tagline">Reserve coffee, brewing gear, and hospitality-grade essentials.</p>
      </div>
      <div className="header__actions">
        {demoUserName && <div className="header__session">Demo shopper: {demoUserName}</div>}
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
