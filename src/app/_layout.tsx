import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { colors } from '@/constants/theme';
import { CartProvider } from '@/hooks/use-cart';
import { ShirtsProvider } from '@/hooks/use-shirts';

export default function RootLayout() {
  return (
    <ShirtsProvider>
      <CartProvider>
        <StatusBar style="dark" />
        <Stack screenOptions={{ contentStyle: { backgroundColor: colors.background } }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="new-shirt" options={{ presentation: 'modal', title: 'Nova camisa' }} />
          <Stack.Screen name="cart" options={{ presentation: 'modal', title: 'Carrinho' }} />
        </Stack>
      </CartProvider>
    </ShirtsProvider>
  );
}
