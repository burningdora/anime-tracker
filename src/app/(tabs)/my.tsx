import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { useMyAnime } from '../../hooks/useMyAnime';
import { colors, radius, spacing } from '../../theme/tokens';
import { STATUS_LABELS, type MyAnimeEntry, type WatchStatus } from '../../types/myAnime';

const STATUS_COLORS: Record<WatchStatus, { background: string; text: string }> = {
  watching: { background: colors.accentSoft, text: colors.accent },
  completed: { background: '#16351F', text: colors.success },
  planned: { background: '#33290F', text: colors.warning },
};

export default function MyAnimeScreen() {
  const router = useRouter();
  const { entries, loading, error, reload, remove } = useMyAnime();
  const [confirmId, setConfirmId] = useState<number | null>(null);

  return (
    <FlatList<MyAnimeEntry>
      data={entries}
      keyExtractor={item => String(item.id)}
      contentContainerStyle={styles.content}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      ListHeaderComponent={
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <Text style={styles.count}>{entries.length} записей</Text>
            {loading ? <ActivityIndicator size="small" color={colors.accent} /> : null}
          </View>
          <Text style={styles.hint}>
            Записи хранятся в SQLite и остаются после перезапуска приложения.
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/')}
            style={({ pressed }) => [styles.findButton, pressed && styles.pressed]}>
            <Text style={styles.findText}>Найти тайтл в каталоге</Text>
          </Pressable>
          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
              <Pressable accessibilityRole="button" onPress={() => void reload()}>
                <Text style={styles.action}>Повторить</Text>
              </Pressable>
            </View>
          ) : null}
        </View>
      }
      ListEmptyComponent={
        !loading && !error ? (
          <Text style={styles.empty}>
            Список пуст. Открой любой тайтл в каталоге и нажми «Добавить в мой список».
          </Text>
        ) : undefined
      }
      renderItem={({ item }) => {
        const palette = STATUS_COLORS[item.status];
        const percent =
          item.totalEpisodes && item.totalEpisodes > 0
            ? Math.min(100, Math.round((item.episodesWatched / item.totalEpisodes) * 100))
            : 0;

        return (
          <View style={styles.card}>
            <View style={styles.topRow}>
              {item.imageUrl ? (
                <Image source={{ uri: item.imageUrl }} style={styles.poster} contentFit="cover" />
              ) : null}
              <View style={styles.info}>
                <Text style={styles.title} numberOfLines={2}>
                  {item.title}
                </Text>
                <View style={styles.pills}>
                  <Text style={[styles.pill, { backgroundColor: palette.background, color: palette.text }]}>
                    {STATUS_LABELS[item.status]}
                  </Text>
                  {item.score !== null ? (
                    <Text style={styles.score}>★ {item.score.toFixed(1)}</Text>
                  ) : null}
                </View>
                <Text style={styles.progressText}>
                  {item.episodesWatched} / {item.totalEpisodes ?? '?'} эп.
                </Text>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${percent}%` }]} />
                </View>
              </View>
            </View>

            {item.note ? <Text style={styles.note}>{item.note}</Text> : null}

            {confirmId === item.id ? (
              <View style={styles.actions}>
                <Text style={styles.confirmText}>Удалить запись?</Text>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => {
                    void remove(item.id);
                    setConfirmId(null);
                  }}>
                  <Text style={styles.danger}>Да</Text>
                </Pressable>
                <Pressable accessibilityRole="button" onPress={() => setConfirmId(null)}>
                  <Text style={styles.action}>Нет</Text>
                </Pressable>
              </View>
            ) : (
              <View style={styles.actions}>
                <Pressable
                  accessibilityRole="button"
                  onPress={() =>
                    router.push({ pathname: '/entry', params: { entryId: String(item.id) } })
                  }>
                  <Text style={styles.action}>Изменить</Text>
                </Pressable>
                <Pressable accessibilityRole="button" onPress={() => setConfirmId(item.id)}>
                  <Text style={styles.danger}>Удалить</Text>
                </Pressable>
              </View>
            )}
          </View>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, paddingBottom: spacing.xl },
  separator: { height: spacing.md },
  header: { gap: spacing.md, marginBottom: spacing.lg },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  count: { color: colors.muted, fontSize: 13 },
  hint: { color: colors.muted, fontSize: 13, lineHeight: 19 },
  findButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: 12,
    alignItems: 'center',
  },
  findText: { color: colors.text, fontSize: 14, fontWeight: '600' },
  pressed: { opacity: 0.75 },
  errorBox: {
    borderWidth: 1,
    borderColor: colors.danger,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  errorText: { color: colors.text, fontSize: 14 },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.md,
  },
  topRow: { flexDirection: 'row', gap: spacing.md },
  poster: { width: 66, height: 96, borderRadius: radius.sm, backgroundColor: colors.surfaceAlt },
  info: { flex: 1, gap: spacing.sm },
  title: { fontSize: 16, fontWeight: '700', color: colors.text, lineHeight: 21 },
  pills: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  pill: {
    fontSize: 11,
    fontWeight: '700',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    overflow: 'hidden',
  },
  score: { color: colors.warning, fontSize: 13, fontWeight: '700' },
  progressText: { color: colors.muted, fontSize: 12 },
  progressBar: { height: 6, borderRadius: 3, backgroundColor: colors.surfaceAlt, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: colors.accent },
  note: { color: colors.muted, fontSize: 14, lineHeight: 20 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  confirmText: { color: colors.text, fontSize: 14, flex: 1 },
  action: { color: colors.accent, fontSize: 14, fontWeight: '600' },
  danger: { color: colors.danger, fontSize: 14, fontWeight: '600' },
  empty: { color: colors.muted, fontSize: 15, lineHeight: 22, marginTop: spacing.xl },
});
