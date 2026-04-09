import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { AdminLayout } from './layouts/AdminLayout';
import { HomePage } from './pages/HomePage';
import { ProductPage } from './pages/ProductPage';
import { CartPage } from './pages/CartPage';
import { CartProvider } from './hooks/useCart';

export function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/products/:id" element={<ProductPage />} />
            <Route path="/cart" element={<CartPage />} />
          </Route>
          <Route path="/admin" element={<AdminLayout />}>
            {/* Admin pages will be added here by Copilot agent demos */}
          </Route>
        </Routes>
      </BrowserRouter>
    </CartProvider>
  );
}
