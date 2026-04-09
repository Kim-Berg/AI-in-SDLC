import { formatPrice } from '@zava/shared';

interface CartItemRowProps {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
  onRemove: () => void;
}

export function CartItemRow({ name, price, quantity, imageUrl, onRemove }: CartItemRowProps) {
  return (
    <div className="cart-item">
      <img className="cart-item__image" src={imageUrl} alt={name} />
      <div className="cart-item__info">
        <div className="cart-item__name">{name}</div>
        <div className="cart-item__price">
          {formatPrice(price)} × {quantity}
        </div>
      </div>
      <div>
        <strong>{formatPrice(price * quantity)}</strong>
      </div>
      <button className="btn btn--secondary" onClick={onRemove}>
        Remove
      </button>
    </div>
  );
}
