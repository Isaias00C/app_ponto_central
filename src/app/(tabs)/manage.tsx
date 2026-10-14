import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Button } from '@/components/button';
import { ShirtImage } from '@/components/shirt-image';
import { ErrorView, LoadingView } from '@/components/state-views';
import { SIZES, type Size } from '@/constants/sizes';
import { colors, radius, spacing } from '@/constants/theme';
import { useShirts } from '@/hooks/use-shirts';
import { addStock, errorMessage } from '@/lib/shirts';

const MAX_QUANTITY = 9999;

type Feedback = { kind: 'success' | 'error'; text: string };

export default function ManageScreen() {
  const { shirts, error, reload } = useShirts();
  const [shirtId, setShirtId] = useState<string | null>(null);
  const [size, setSize] = useState<Size | null>(null);
  const [quantity, setQuantity] = useState('1');
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  if (!shirts) {
    return error ? <ErrorView message={error} onRetry={reload} /> : <LoadingView />;
  }

  const selected = shirts.find((shirt) => shirt.id === shirtId) ?? null;
  const amount = Number.parseInt(quantity, 10);
  const validAmount = Number.isInteger(amount) && amount > 0 && amount <= MAX_QUANTITY;
  const canSubmit = selected !== null && size !== null && validAmount;

  function changeQuantity(delta: number) {
    const next = Math.min(MAX_QUANTITY, Math.max(1, (Number.isInteger(amount) ? amount : 0) + delta));
    setQuantity(String(next));
  }

  async function onRefresh() {
    setRefreshing(true);
    await reload();
    setRefreshing(false);
  }

  async function submit() {
    if (!selected || !size || !validAmount) return;

    setSaving(true);
    setFeedback(null);
    try {
      const newQuantity = await addStock(selected.id, size, amount);
      await reload();
      setQuantity('1');
      setFeedback({
        kind: 'success',
        text: `+${amount} no tamanho ${size}. Estoque atual: ${newQuantity}.`,
      });
    } catch (e) {
      setFeedback({ kind: 'error', text: errorMessage(e) });
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      automaticallyAdjustKeyboardInsets
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>1. Camisa</Text>
        {shirts.map((shirt) => {
          const active = shirt.id === shirtId;
          return (
            <Pressable
              key={shirt.id}
              accessibilityRole="radio"
              accessibilityState={{ selected: active }}
              onPress={() => setShirtId(shirt.id)}
              style={[styles.option, active && styles.optionActive]}
            >
              <ShirtImage uri={shirt.imageUrl} style={styles.thumb} />
              <Text style={styles.optionText} numberOfLines={2}>
                {shirt.description}
              </Text>
              {active ? <Ionicons name="checkmark-circle" size={22} color={colors.primary} /> : null}
            </Pressable>
          );
        })}
        <Button label="Cadastrar nova camisa" variant="secondary" onPress={() => router.push('/new-shirt')} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>2. Tamanho</Text>
        <View style={styles.chips}>
          {SIZES.map((item) => {
            const active = item === size;
            return (
              <Pressable
                key={item}
                accessibilityRole="radio"
                accessibilityState={{ selected: active }}
                onPress={() => setSize(item)}
                style={[styles.chip, active && styles.chipActive]}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{item}</Text>
                {selected ? (
                  <Text style={[styles.chipStock, active && styles.chipTextActive]}>
                    {selected.stock[item]}
                  </Text>
                ) : null}
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>3. Quantidade a adicionar</Text>
        <View style={styles.stepper}>
          <Pressable
            accessibilityLabel="Diminuir quantidade"
            onPress={() => changeQuantity(-1)}
            style={styles.stepperButton}
          >
            <Ionicons name="remove" size={24} color={colors.primary} />
          </Pressable>
          <TextInput
            accessibilityLabel="Quantidade"
            value={quantity}
            onChangeText={(text) => setQuantity(text.replace(/\D/g, '').slice(0, 4))}
            keyboardType="number-pad"
            selectTextOnFocus
            style={styles.quantityInput}
          />
          <Pressable
            accessibilityLabel="Aumentar quantidade"
            onPress={() => changeQuantity(1)}
            style={styles.stepperButton}
          >
            <Ionicons name="add" size={24} color={colors.primary} />
          </Pressable>
        </View>
      </View>

      {feedback ? (
        <Text style={[styles.feedback, feedback.kind === 'success' ? styles.success : styles.failure]}>
          {feedback.text}
        </Text>
      ) : null}

      <Button label="Adicionar ao estoque" onPress={submit} disabled={!canSubmit} loading={saving} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.xl,
    padding: spacing.lg,
  },
  section: {
    gap: spacing.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.border,
  },
  optionActive: {
    borderColor: colors.primary,
  },
  thumb: {
    width: 48,
    height: 48,
  },
  optionText: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    minWidth: 64,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    borderWidth: 2,
    borderColor: colors.border,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  chipStock: {
    fontSize: 12,
    color: colors.textMuted,
  },
  chipTextActive: {
    color: colors.primaryText,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  stepperButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  quantityInput: {
    flex: 1,
    height: 48,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  feedback: {
    borderRadius: radius.sm,
    padding: spacing.md,
    fontSize: 14,
  },
  success: {
    backgroundColor: colors.successSurface,
    color: colors.success,
  },
  failure: {
    backgroundColor: colors.dangerSurface,
    color: colors.danger,
  },
});
