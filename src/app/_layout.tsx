import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { LoadingView } from '@/components/state-views';
import { colors } from '@/constants/theme';
import { AuthProvider, useAuth } from '@/hooks/use-auth';
import { CartProvider } from '@/hooks/use-cart';
import { ShirtsProvider } from '@/hooks/use-shirts';

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}

function RootNavigator() {
  const { session } = useAuth();

  // Enquanto a sessao salva e restaurada, evita piscar a tela de login para quem ja entrou.
  if (session === undefined) return <LoadingView />;

  const signedIn = session !== null;

  // Os guardas so escondem as rotas no cliente; quem protege os dados de verdade e o RLS (migration03).
  return (
    <ShirtsProvider>
      <CartProvider>
        <StatusBar style="dark" />
        <Stack screenOptions={{ contentStyle: { backgroundColor: colors.background } }}>
          <Stack.Protected guard={signedIn}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="new-shirt" options={{ presentation: 'modal', title: 'Nova camisa' }} />
            <Stack.Screen name="cart" options={{ presentation: 'modal', title: 'Carrinho' }} />
          </Stack.Protected>

          <Stack.Protected guard={!signedIn}>
            <Stack.Screen name="login" options={{ headerShown: false }} />
          </Stack.Protected>
        </Stack>
      </CartProvider>
    </ShirtsProvider>
  );
}
