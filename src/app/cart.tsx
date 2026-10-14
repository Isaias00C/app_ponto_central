import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/button';
import { QuantityStepper } from '@/components/quantity-stepper';
import { ShirtImage } from '@/components/shirt-image';
import { EmptyView, ErrorView, LoadingView } from '@/components/state-views';
import { colors, radius, spacing } from '@/constants/theme';
import { useCart } from '@/hooks/use-cart';
import { useShirts } from '@/hooks/use-shirts';
import { confirmAction } from '@/lib/confirm';
import { units } from '@/lib/format';
import { checkoutStock, errorMessage } from '@/lib/shirts';

export default function CartScreen() {
  const { shirts, error, reload } = useShirts();
  const { items, totalUnits, setQuantity, clear } = useCart();
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);

  // Garante o estoque atualizado antes de conferir o carrinho.
  useEffect(() => {
    reload();
  }, [reload]);

  if (!shirts) {
    return error ? <ErrorView message={error} onRetry={reload} /> : <LoadingView />;
  }

  if (items.length === 0) {
    return done ? (
      <View style={styles.doneContainer}>
        <EmptyView title="Baixa realizada" message="O estoque foi atualizado." />
        <View style={styles.doneAction}>
          <Button label="Voltar" onPress={() => router.back()} />
        </View>
      </View>
    ) : (
      <EmptyView
        title="Carrinho vazio"
        message="Abra uma camisa e toque em + nos tamanhos para separar as unidades."
      />
    );
  }

  const rows = items.map((item) => {
    const shirt = shirts.find((candidate) => candidate.id === item.shirtId);
    const available = shirt?.stock[item.size] ?? 0;
    return { item, shirt, available, insufficient: item.quantity > available };
  });
  const hasInsufficient = rows.some((row) => row.insufficient);

  function confirm() {
    confirmAction({
      title: 'Dar baixa no estoque?',
      message: `${units(totalUnits)} serão retiradas do estoque.`,
      confirmLabel: 'Dar baixa',
      onConfirm: submit,
    });
  }

  async function submit() {
    setSaving(true);
    setFailure(null);
    try {
      await checkoutStock(items);
      clear();
      setDone(true);
    } catch (e) {
      setFailure(errorMessage(e));
    } finally {
      await reload();
      setSaving(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.content}>
      {rows.map(({ item, shirt, available, insufficient }) => (
        <View
          key={`${item.shirtId}:${item.size}`}
          style={[styles.row, insufficient && styles.rowInsufficient]}
        >
          <ShirtImage uri={shirt?.imageUrl ?? null} style={styles.thumb} />
          <View style={styles.info}>
            <Text style={styles.description} numberOfLines={2}>
              {shirt?.description ?? 'Camisa removida'}
            </Text>
            <Text style={styles.meta}>
              Tamanho {item.size} · {available} em estoque
            </Text>
            {insufficient ? (
              <Text style={styles.warning}>Estoque insuficiente para essa quantidade.</Text>
            ) : null}
            <View style={styles.controls}>
              <QuantityStepper
                value={item.quantity}
                max={available}
                min={1}
                label={`${shirt?.description ?? 'camisa'} tamanho ${item.size}`}
                onChange={(value) => setQuantity(item.shirtId, item.size, value)}
              />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Remover do carrinho"
                onPress={() => setQuantity(item.shirtId, item.size, 0)}
                hitSlop={8}
              >
                <Ionicons name="trash-outline" size={22} color={colors.danger} />
              </Pressable>
            </View>
          </View>
        </View>
      ))}

      <Text style={styles.total}>Total: {units(totalUnits)}</Text>

      {failure ? <Text style={styles.failure}>{failure}</Text> : null}

      <Button
        label="Dar baixa no estoque"
        onPress={confirm}
        disabled={hasInsufficient}
        loading={saving}
      />
      <Button label="Limpar carrinho" variant="secondary" onPress={clear} disabled={saving} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.md,
    padding: spacing.lg,
  },
  doneContainer: {
    flex: 1,
  },
  doneAction: {
    padding: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rowInsufficient: {
    borderColor: colors.danger,
  },
  thumb: {
    width: 72,
    height: 72,
  },
  info: {
    flex: 1,
    gap: spacing.xs,
  },
  description: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  meta: {
    fontSize: 13,
    color: colors.textMuted,
  },
  warning: {
    fontSize: 13,
    color: colors.danger,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  total: {
    marginTop: spacing.sm,
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'right',
  },
  failure: {
    backgroundColor: colors.dangerSurface,
    color: colors.danger,
    borderRadius: radius.sm,
    padding: spacing.md,
    fontSize: 14,
  },
});
