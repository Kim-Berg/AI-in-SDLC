import { Outlet } from 'react-router-dom';
import { Header } from '../components/Header';
import { useCart } from '../hooks/useCart';

export function MainLayout() {
  const { itemCount, demoUserName, sessionReady } = useCart();

  return (
    <>
      <Header cartItemCount={itemCount} demoUserName={sessionReady ? demoUserName : 'Preparing demo session'} />
      <main className="main">
        <Outlet />
      </main>
    </>
  );
}
