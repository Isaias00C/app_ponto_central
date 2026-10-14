import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ShirtImage } from '@/components/shirt-image';
import { colors, radius, spacing } from '@/constants/theme';
import type { Shirt } from '@/lib/shirts';

export function ShirtCard({ shirt }: { shirt: Shirt }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${shirt.description}. Estoque total: ${shirt.total}`}
      onPress={() => router.push({ pathname: '/shirt/[id]', params: { id: shirt.id } })}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <ShirtImage uri={shirt.imageUrl} style={styles.image} />
      <View style={styles.info}>
        <Text style={styles.description} numberOfLines={3}>
          {shirt.description}
        </Text>
        <Text style={styles.stock}>
          Estoque total: <Text style={styles.stockValue}>{shirt.total}</Text>
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  pressed: {
    opacity: 0.7,
  },
  image: {
    width: 96,
    height: 96,
  },
  info: {
    flex: 1,
    gap: spacing.sm,
  },
  description: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  stock: {
    fontSize: 14,
    color: colors.textMuted,
  },
  stockValue: {
    fontWeight: '700',
    color: colors.text,
  },
});
