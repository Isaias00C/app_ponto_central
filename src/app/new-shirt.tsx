import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { Button } from '@/components/button';
import { ShirtImage } from '@/components/shirt-image';
import { colors, radius, spacing } from '@/constants/theme';
import { useShirts } from '@/hooks/use-shirts';
import { pickShirtImage, uploadShirtImage, type PickedImage } from '@/lib/shirt-images';
import { createShirt, errorMessage } from '@/lib/shirts';

export default function NewShirtScreen() {
  const { reload } = useShirts();
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<PickedImage | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const trimmedDescription = description.trim();
  const canSubmit = trimmedDescription.length > 0;

  async function chooseImage() {
    setError(null);
    try {
      const picked = await pickShirtImage();
      if (picked) setImage(picked);
    } catch (e) {
      setError(errorMessage(e));
    }
  }

  async function submit() {
    if (!canSubmit) return;

    setSaving(true);
    setError(null);
    try {
      const imageUrl = image ? await uploadShirtImage(image) : null;
      await createShirt({ description: trimmedDescription, imageUrl });
      await reload();
      router.back();
    } catch (e) {
      setError(errorMessage(e));
      setSaving(false);
    }
  }

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      automaticallyAdjustKeyboardInsets
    >
      <View style={styles.field}>
        <Text style={styles.label}>Descrição</Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="Ex.: Camisa azul lisa na frente e estampada atrás"
          placeholderTextColor={colors.textMuted}
          multiline
          style={[styles.input, styles.multiline]}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Imagem (opcional)</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={image ? 'Trocar imagem' : 'Escolher imagem da galeria'}
          onPress={chooseImage}
          disabled={saving}
          style={({ pressed }) => pressed && styles.pressed}
        >
          <ShirtImage uri={image?.uri ?? null} style={styles.preview} />
        </Pressable>
        <View style={styles.imageActions}>
          <View style={styles.imageAction}>
            <Button
              label={image ? 'Trocar imagem' : 'Escolher da galeria'}
              variant="secondary"
              onPress={chooseImage}
              disabled={saving}
            />
          </View>
          {image ? (
            <View style={styles.imageAction}>
              <Button
                label="Remover"
                variant="secondary"
                onPress={() => setImage(null)}
                disabled={saving}
              />
            </View>
          ) : null}
        </View>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Button label="Salvar camisa" onPress={submit} disabled={!canSubmit} loading={saving} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.xl,
    padding: spacing.lg,
  },
  field: {
    gap: spacing.sm,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  input: {
    minHeight: 48,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  multiline: {
    minHeight: 96,
    textAlignVertical: 'top',
  },
  preview: {
    width: '100%',
    aspectRatio: 1,
  },
  pressed: {
    opacity: 0.7,
  },
  imageActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  imageAction: {
    flex: 1,
  },
  error: {
    backgroundColor: colors.dangerSurface,
    color: colors.danger,
    borderRadius: radius.sm,
    padding: spacing.md,
    fontSize: 14,
  },
});
