import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useState } from 'react';
import { StyleSheet, View, type ImageStyle, type StyleProp } from 'react-native';

import { colors, radius } from '@/constants/theme';

type Props = {
  uri: string | null;
  style?: StyleProp<ImageStyle>;
};

export function ShirtImage({ uri, style }: Props) {
  const [failedUri, setFailedUri] = useState<string | null>(null);

  if (!uri || failedUri === uri) {
    return (
      <View style={[styles.base, styles.placeholder, style]}>
        <Ionicons name="shirt-outline" size={32} color={colors.textMuted} />
      </View>
    );
  }

  return (
    <Image
      source={{ uri }}
      style={[styles.base, style]}
      contentFit="cover"
      transition={200}
      onError={() => setFailedUri(uri)}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.sm,
    overflow: 'hidden',
  },
  placeholder: {
    backgroundColor: colors.placeholder,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
