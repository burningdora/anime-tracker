import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { AnimeCard } from '../../components/AnimeCard';
import { useFavorites } from '../../hooks/useFavorites';
import { colors, spacing } from '../../theme/tokens';
import type { Anime } from '../../types/anime';

export default function FavoritesScreen() {
  const { favorites, clearFavorites } = useFavorites();
  const [confirm, setConfirm] = useState(false);

  return (
    <FlatList<Anime>
      data={favorites}
      keyExtractor={item => String(item.id)}
      contentContainerStyle={styles.content}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      ListHeaderComponent={
        <View style={styles.header}>
          <Text style={styles.count}>{favorites.length} в избранном</Text>
          {favorites.length > 0 ? (
            confirm ? (
              <View style={styles.confirmRow}>
                <Text style={styles.confirmText}>Очистить всё?</Text>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => {
                    clearFavorites();
                    setConfirm(false);
                  }}>
                  <Text style={styles.danger}>Да</Text>
                </Pressable>
                <Pressable accessibilityRole="button" onPress={() => setConfirm(false)}>
                  <Text style={styles.action}>Нет</Text>
                </Pressable>
              </View>
            ) : (
              <Pressable accessibilityRole="button" onPress={() => setConfirm(true)}>
                <Text style={styles.action}>Очистить</Text>
              </Pressable>
            )
          ) : null}
        </View>
      }
      ListEmptyComponent={
        <Text style={styles.empty}>
          Пока пусто. Нажми ♡ на карточке тайтла — он появится здесь.
        </Text>
      }
      renderItem={({ item }) => <AnimeCard anime={item} />}
    />
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, paddingBottom: spacing.xl },
  separator: { height: spacing.md },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  count: { color: colors.muted, fontSize: 13 },
  confirmRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  confirmText: { color: colors.text, fontSize: 13 },
  action: { color: colors.accent, fontSize: 14, fontWeight: '700' },
  danger: { color: colors.danger, fontSize: 14, fontWeight: '700' },
  empty: { color: colors.muted, fontSize: 15, lineHeight: 22, marginTop: spacing.xl },
});
