import { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { AnimeCard } from '../../components/AnimeCard';
import { PaginationControls } from '../../components/PaginationControls';
import { SearchInput } from '../../components/SearchInput';
import { useAnimeList } from '../../hooks/useAnimeList';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { colors, radius, spacing } from '../../theme/tokens';
import type { Anime } from '../../types/anime';

export default function CatalogScreen() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search, 450);
  const { anime, pageInfo, loading, refreshing, error, retry, refresh } = useAnimeList(
    debouncedSearch,
    page,
  );
  const isSearching = debouncedSearch.trim().length > 0;

  function handleSearch(value: string) {
    setSearch(value);
    setPage(1);
  }

  return (
    <FlatList<Anime>
      data={anime}
      keyExtractor={item => String(item.id)}
      contentContainerStyle={styles.content}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      keyboardShouldPersistTaps="handled"
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={refresh}
          tintColor={colors.accent}
          colors={[colors.accent]}
        />
      }
      ListHeaderComponent={
        <View style={styles.header}>
          <SearchInput value={search} onChangeText={handleSearch} />

          <View style={styles.metaRow}>
            <Text style={styles.count}>
              {isSearching
                ? 'Результаты поиска'
                : pageInfo
                  ? `${pageInfo.total} тайтлов`
                  : 'Загрузка каталога…'}
            </Text>
            {loading ? <ActivityIndicator size="small" color={colors.accent} /> : null}
          </View>

          {isSearching ? null : (
            <PaginationControls
              page={pageInfo?.currentPage ?? page}
              totalPages={pageInfo?.lastPage ?? 1}
              disabled={loading}
              onPrev={() => setPage(value => Math.max(1, value - 1))}
              onNext={() => setPage(value => value + 1)}
            />
          )}

          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
              <Pressable accessibilityRole="button" onPress={retry}>
                <Text style={styles.errorAction}>Повторить</Text>
              </Pressable>
            </View>
          ) : null}
        </View>
      }
      ListEmptyComponent={
        !loading && !error ? (
          <Text style={styles.empty}>Ничего не найдено. Попробуй другое название.</Text>
        ) : undefined
      }
      renderItem={({ item }) => <AnimeCard anime={item} />}
    />
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, paddingBottom: spacing.xl },
  separator: { height: spacing.md },
  header: { gap: spacing.md, marginBottom: spacing.lg },
  metaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  count: { color: colors.muted, fontSize: 13 },
  errorBox: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.danger,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  errorText: { color: colors.text, fontSize: 14, lineHeight: 20 },
  errorAction: { color: colors.accent, fontSize: 14, fontWeight: '700' },
  empty: { color: colors.muted, fontSize: 15, textAlign: 'center', marginTop: spacing.xl },
});
