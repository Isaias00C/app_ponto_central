import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

import { colors, radius, spacing } from '@/constants/theme';

type Props = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  loading?: boolean;
};

export function Button({ label, onPress, variant = 'primary', disabled, loading }: Props) {
  const inactive = disabled || loading;
  const primary = variant === 'primary';
  const danger = variant === 'danger';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: inactive, busy: loading }}
      disabled={inactive}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        primary ? styles.primary : danger ? styles.danger : styles.secondary,
        inactive && styles.inactive,
        pressed && styles.pressed,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          color={primary ? colors.primaryText : danger ? colors.danger : colors.primary}
        />
      ) : (
        <Text
          style={[
            styles.label,
            !primary && styles.secondaryLabel,
            danger && styles.dangerLabel,
          ]}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.sm,
    paddingHorizontal: spacing.xl,
  },
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  danger: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.danger,
  },
  inactive: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primaryText,
  },
  secondaryLabel: {
    color: colors.primary,
  },
  dangerLabel: {
    color: colors.danger,
  },
});
