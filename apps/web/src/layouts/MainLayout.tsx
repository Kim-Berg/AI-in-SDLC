import { Outlet } from 'react-router-dom';
import { Header } from '../components/Header';
import { useCart } from '../hooks/useCart';

export function MainLayout() {
  const { itemCount } = useCart();

  return (
    <>
      <Header cartItemCount={itemCount} />
      <main className="main">
        <Outlet />
      </main>
    </>
  );
}
