import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text } from 'react-native';

import { colors, radius, spacing } from '@/constants/theme';
import { useCart } from '@/hooks/use-cart';
import { units } from '@/lib/format';

/** Barra fixa acima da navbar com o resumo do carrinho; some quando o carrinho esta vazio. */
export function CartBar() {
  const { totalUnits } = useCart();
  if (totalUnits === 0) return null;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Abrir carrinho com ${units(totalUnits)}`}
      onPress={() => router.push('/cart')}
      style={({ pressed }) => [styles.bar, pressed && styles.pressed]}
    >
      <Ionicons name="cart" size={22} color={colors.primaryText} />
      <Text style={styles.text}>Carrinho: {units(totalUnits)}</Text>
      <Text style={styles.action}>Dar baixa</Text>
      <Ionicons name="chevron-forward" size={18} color={colors.primaryText} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginHorizontal: spacing.lg,
    marginVertical: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
  },
  pressed: {
    opacity: 0.85,
  },
  text: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: colors.primaryText,
  },
  action: {
    fontSize: 14,
    color: colors.primaryText,
  },
});
