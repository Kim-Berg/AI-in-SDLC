import { Link } from 'react-router-dom';

interface HeaderProps {
  cartItemCount: number;
}

export function Header({ cartItemCount }: HeaderProps) {
  return (
    <header className="header">
      <Link to="/" className="header__logo">
        ZAVA
      </Link>
      <nav className="header__nav">
        <Link to="/">Shop</Link>
        <Link to="/cart">
          Cart
          {cartItemCount > 0 && <span className="header__cart-badge">{cartItemCount}</span>}
        </Link>
      </nav>
    </header>
  );
}
