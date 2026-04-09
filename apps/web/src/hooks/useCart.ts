import { useState, useCallback } from 'react';
import { api } from '../services/apiClient';

interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
    imageUrl: string;
  };
}

interface Cart {
  id: string;
  items: CartItem[];
  total: number;
}

export function useCart() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCart = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getCart();
      setCart(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load cart');
    } finally {
      setLoading(false);
    }
  }, []);

  const addItem = useCallback(async (productId: string, quantity: number) => {
    try {
      const data = await api.addToCart(productId, quantity);
      setCart(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add item');
    }
  }, []);

  const removeItem = useCallback(async (itemId: string) => {
    try {
      await api.removeFromCart(itemId);
      setCart((prev) =>
        prev
          ? {
              ...prev,
              items: prev.items.filter((i) => i.id !== itemId),
              total: prev.items
                .filter((i) => i.id !== itemId)
                .reduce((sum, i) => sum + i.product.price * i.quantity, 0),
            }
          : null,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove item');
    }
  }, []);

  const itemCount = cart?.items.reduce((sum, i) => sum + i.quantity, 0) ?? 0;

  return { cart, loading, error, fetchCart, addItem, removeItem, itemCount };
}
