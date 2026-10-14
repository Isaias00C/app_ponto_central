import { Stack } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { CartBar } from '@/components/cart-bar';
import { colors } from '@/constants/theme';

export default function HomeLayout() {
  return (
    <View style={styles.container}>
      <Stack screenOptions={{ contentStyle: { backgroundColor: colors.background } }}>
        <Stack.Screen name="index" options={{ title: 'Camisas' }} />
        <Stack.Screen name="shirt/[id]" options={{ title: 'Tamanhos disponíveis' }} />
      </Stack>
      <CartBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
