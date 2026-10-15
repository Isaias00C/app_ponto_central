import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router';

import { LoadingView } from '@/components/state-views';
import { HomeLayout, TabsLayout } from '@/components/tabs-layout';
import { AuthProvider, useAuth } from '@/hooks/use-auth';
import { CartProvider } from '@/hooks/use-cart';
import { ShirtsProvider } from '@/hooks/use-shirts';
import { CartPage } from '@/pages/cart-page';
import { EditShirtPage } from '@/pages/edit-shirt-page';
import { HomePage } from '@/pages/home-page';
import { LoginPage } from '@/pages/login-page';
import { ManagePage } from '@/pages/manage-page';
import { NewShirtPage } from '@/pages/new-shirt-page';
import { ShirtDetailPage } from '@/pages/shirt-detail-page';

export default function App() {
  return (
    // O basename e o subcaminho do GitHub Pages (`base` do vite.config.ts).
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

function AppRoutes() {
  const { session } = useAuth();

  // Enquanto a sessao salva e restaurada, evita piscar a tela de login para quem ja entrou.
  if (session === undefined) return <LoadingView />;

  const signedIn = session !== null;

  // Os guardas so escondem as rotas no cliente; quem protege os dados de verdade e o RLS (migration03).
  return (
    <ShirtsProvider>
      <CartProvider>
        <Routes>
          <Route element={<Guard allow={signedIn} redirectTo="/login" />}>
            <Route element={<TabsLayout />}>
              <Route element={<HomeLayout />}>
                <Route index element={<HomePage />} />
                <Route path="shirt/:id" element={<ShirtDetailPage />} />
              </Route>
              <Route path="manage" element={<ManagePage />} />
            </Route>
            <Route path="cart" element={<CartPage />} />
            <Route path="new-shirt" element={<NewShirtPage />} />
            <Route path="edit-shirt/:id" element={<EditShirtPage />} />
          </Route>

          <Route element={<Guard allow={!signedIn} redirectTo="/" />}>
            <Route path="login" element={<LoginPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </CartProvider>
    </ShirtsProvider>
  );
}

function Guard({ allow, redirectTo }: { allow: boolean; redirectTo: string }) {
  return allow ? <Outlet /> : <Navigate to={redirectTo} replace />;
}
