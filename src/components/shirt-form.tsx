import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { Button } from '@/components/button';
import { ShirtImage } from '@/components/shirt-image';
import { colors, radius, spacing } from '@/constants/theme';
import { pickShirtImage, type PickedImage } from '@/lib/shirt-images';
import { errorMessage } from '@/lib/shirts';

export type ShirtFormValues = {
  description: string;
  /** Imagem nova escolhida na galeria, se houver. */
  image: PickedImage | null;
  /** A imagem que ja existia foi removida (e nenhuma nova foi escolhida). */
  removeImage: boolean;
};

type Props = {
  initialDescription?: string;
  initialImageUrl?: string | null;
  submitLabel: string;
  /** Quem chama navega ao terminar; se lancar, a mensagem aparece no formulario. */
  onSubmit: (values: ShirtFormValues) => Promise<void>;
};

export function ShirtForm({
  initialDescription = '',
  initialImageUrl = null,
  submitLabel,
  onSubmit,
}: Props) {
  const [description, setDescription] = useState(initialDescription);
  const [image, setImage] = useState<PickedImage | null>(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const trimmedDescription = description.trim();
  const canSubmit = trimmedDescription.length > 0;
  const previewUri = image?.uri ?? (removeImage ? null : initialImageUrl);

  async function chooseImage() {
    setError(null);
    try {
      const picked = await pickShirtImage();
      if (picked) setImage(picked);
    } catch (e) {
      setError(errorMessage(e));
    }
  }

  function clearImage() {
    setImage(null);
    setRemoveImage(true);
  }

  async function submit() {
    if (!canSubmit) return;

    setSaving(true);
    setError(null);
    try {
      await onSubmit({
        description: trimmedDescription,
        image,
        removeImage: removeImage && image === null,
      });
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
          accessibilityLabel={previewUri ? 'Trocar imagem' : 'Escolher imagem da galeria'}
          onPress={chooseImage}
          disabled={saving}
          style={({ pressed }) => pressed && styles.pressed}
        >
          <ShirtImage uri={previewUri} style={styles.preview} />
        </Pressable>
        <View style={styles.imageActions}>
          <View style={styles.imageAction}>
            <Button
              label={previewUri ? 'Trocar imagem' : 'Escolher da galeria'}
              variant="secondary"
              onPress={chooseImage}
              disabled={saving}
            />
          </View>
          {previewUri ? (
            <View style={styles.imageAction}>
              <Button label="Remover" variant="secondary" onPress={clearImage} disabled={saving} />
            </View>
          ) : null}
        </View>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Button label={submitLabel} onPress={submit} disabled={!canSubmit} loading={saving} />
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
