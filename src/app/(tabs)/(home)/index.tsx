import { useState } from 'react';
import { FlatList, StyleSheet, Text } from 'react-native';

import { ShirtCard } from '@/components/shirt-card';
import { EmptyView, ErrorView, LoadingView } from '@/components/state-views';
import { colors, radius, spacing } from '@/constants/theme';
import { useShirts } from '@/hooks/use-shirts';

export default function HomeScreen() {
  const { shirts, error, reload } = useShirts();
  const [refreshing, setRefreshing] = useState(false);

  async function onRefresh() {
    setRefreshing(true);
    await reload();
    setRefreshing(false);
  }

  if (!shirts) {
    return error ? <ErrorView message={error} onRetry={reload} /> : <LoadingView />;
  }

  return (
    <FlatList
      data={shirts}
      keyExtractor={(shirt) => shirt.id}
      renderItem={({ item }) => <ShirtCard shirt={item} />}
      contentContainerStyle={styles.content}
      refreshing={refreshing}
      onRefresh={onRefresh}
      ListHeaderComponent={
        error ? <Text style={styles.banner}>Não foi possível atualizar: {error}</Text> : null
      }
      ListEmptyComponent={
        <EmptyView
          title="Nenhuma camisa cadastrada"
          message="Vá em Gerenciar para cadastrar a primeira camisa."
        />
      }
    />
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    gap: spacing.md,
    padding: spacing.lg,
  },
  banner: {
    backgroundColor: colors.dangerSurface,
    color: colors.danger,
    borderRadius: radius.sm,
    padding: spacing.md,
  },
});
