import { useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { QuantityStepper } from '@/components/quantity-stepper';
import { ShirtImage } from '@/components/shirt-image';
import { EmptyView, ErrorView, LoadingView } from '@/components/state-views';
import { SIZES } from '@/constants/sizes';
import { colors, radius, spacing } from '@/constants/theme';
import { useCart } from '@/hooks/use-cart';
import { useShirts } from '@/hooks/use-shirts';

export default function ShirtDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { shirts, error, reload } = useShirts();
  const { quantityOf, setQuantity } = useCart();

  if (!shirts) {
    return error ? <ErrorView message={error} onRetry={reload} /> : <LoadingView />;
  }

  const shirt = shirts.find((item) => item.id === id);
  if (!shirt) return <EmptyView title="Camisa não encontrada" />;

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <ShirtImage uri={shirt.imageUrl} style={styles.image} />
      <Text style={styles.description}>{shirt.description}</Text>

      <Text style={styles.hint}>
        Toque em + para separar unidades no carrinho e dar baixa no estoque (venda).
      </Text>

      <View style={styles.sizes}>
        {SIZES.map((size) => {
          const available = shirt.stock[size];
          return (
            <View key={size} style={styles.row}>
              <View>
                <Text style={styles.size}>{size}</Text>
                <Text style={[styles.quantity, available === 0 && styles.soldOut]}>
                  {available === 0 ? 'Esgotado' : `${available} em estoque`}
                </Text>
              </View>
              <QuantityStepper
                value={quantityOf(shirt.id, size)}
                max={available}
                label={`tamanho ${size}`}
                onChange={(value) => setQuantity(shirt.id, size, value)}
              />
            </View>
          );
        })}
        <View style={[styles.row, styles.totalRow]}>
          <Text style={styles.size}>Total</Text>
          <Text style={styles.total}>{shirt.total} un.</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.lg,
    padding: spacing.lg,
  },
  image: {
    width: '100%',
    aspectRatio: 1,
  },
  description: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  hint: {
    fontSize: 14,
    color: colors.textMuted,
  },
  sizes: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  totalRow: {
    borderBottomWidth: 0,
  },
  size: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  quantity: {
    fontSize: 14,
    color: colors.textMuted,
  },
  soldOut: {
    color: colors.danger,
  },
  total: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
});
