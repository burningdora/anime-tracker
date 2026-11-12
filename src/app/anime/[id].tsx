import { Image } from 'expo-image';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useAnime } from '../../hooks/useAnime';
import { useEntry } from '../../hooks/useEntry';
import { useFavorites } from '../../hooks/useFavorites';
import { colors, radius, spacing } from '../../theme/tokens';
import { STATUS_LABELS } from '../../types/myAnime';

const STATUS_RU: Record<string, string> = {
  RELEASING: 'Выходит',
  FINISHED: 'Завершён',
  NOT_YET_RELEASED: 'Анонс',
  CANCELLED: 'Отменён',
  HIATUS: 'Пауза',
};

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function parseAnimeId(value: string | undefined): number | null {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null;
}

export default function AnimeDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const animeId = parseAnimeId(first(params.id));

  const { anime, loading, error, retry } = useAnime(animeId);
  const { entry } = useEntry(animeId);
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const favorite = anime ? isFavorite(anime.id) : false;

  function openEntryForm() {
    if (!anime) return;

    if (entry) {
      router.push({ pathname: '/entry', params: { entryId: String(entry.id) } });
      return;
    }

    router.push({
      pathname: '/entry',
      params: {
        malId: String(anime.id),
        title: anime.title,
        imageUrl: anime.imageUrl,
        totalEpisodes: anime.episodes != null ? String(anime.episodes) : '',
      },
    });
  }

  const meta = anime
    ? [
        anime.year,
        anime.format,
        anime.episodes ? `${anime.episodes} эп.` : null,
        anime.status ? STATUS_RU[anime.status] ?? anime.status : null,
      ]
        .filter(Boolean)
        .join(' • ')
    : '';

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Stack.Screen options={{ title: anime?.title ?? 'Аниме' }} />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
          {animeId !== null ? (
            <Pressable accessibilityRole="button" onPress={retry}>
              <Text style={styles.action}>Повторить</Text>
            </Pressable>
          ) : null}
        </View>
      ) : anime ? (
        <>
          <Image source={{ uri: anime.imageUrl }} style={styles.poster} contentFit="cover" />

          <Text style={styles.title}>{anime.title}</Text>
          {meta ? <Text style={styles.meta}>{meta}</Text> : null}

          {anime.score !== null ? (
            <Text style={styles.score}>★ {anime.score.toFixed(1)} / 10</Text>
          ) : null}

          {anime.genres.length > 0 ? (
            <View style={styles.genres}>
              {anime.genres.map(genre => (
                <Text key={genre} style={styles.genre}>
                  {genre}
                </Text>
              ))}
            </View>
          ) : null}

          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              onPress={() =>
                favorite ? removeFavorite(anime.id) : addFavorite(anime)
              }
              style={({ pressed }) => [
                styles.secondaryButton,
                favorite && styles.favoriteActive,
                pressed && styles.pressed,
              ]}>
              <Text style={styles.secondaryText}>
                {favorite ? '♥ В избранном' : '♡ В избранное'}
              </Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              onPress={openEntryForm}
              style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}>
              <Text style={styles.primaryText}>
                {entry ? 'Редактировать запись' : 'Добавить в мой список'}
              </Text>
            </Pressable>
          </View>

          {entry ? (
            <Text style={styles.entryHint}>
              В моём списке: {STATUS_LABELS[entry.status]} • {entry.episodesWatched}/
              {entry.totalEpisodes ?? '?'} эп.
              {entry.score !== null ? ` • оценка ${entry.score.toFixed(1)}` : ''}
            </Text>
          ) : null}

          <Text style={styles.sectionTitle}>Описание</Text>
          <Text style={styles.description}>{anime.description ?? 'Описание отсутствует.'}</Text>
        </>
      ) : (
        <View style={styles.center}>
          <Text style={styles.errorText}>Некорректная ссылка на тайтл</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, paddingBottom: spacing.xl, gap: spacing.md },
  center: { alignItems: 'center', justifyContent: 'center', paddingVertical: 64, gap: spacing.md },
  poster: {
    width: 180,
    height: 260,
    alignSelf: 'center',
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceAlt,
  },
  title: { fontSize: 24, fontWeight: '800', color: colors.text, lineHeight: 30 },
  meta: { color: colors.muted, fontSize: 14 },
  score: { color: colors.warning, fontSize: 16, fontWeight: '700' },
  genres: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  genre: {
    fontSize: 12,
    color: colors.accent,
    backgroundColor: colors.accentSoft,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    overflow: 'hidden',
  },
  actions: { gap: spacing.sm, marginTop: spacing.sm },
  primaryButton: {
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  secondaryButton: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingVertical: 14,
    alignItems: 'center',
  },
  favoriteActive: { borderColor: colors.accent, backgroundColor: colors.accentSoft },
  secondaryText: { color: colors.text, fontSize: 15, fontWeight: '600' },
  pressed: { opacity: 0.75 },
  entryHint: { color: colors.muted, fontSize: 13, lineHeight: 19 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: colors.text, marginTop: spacing.md },
  description: { color: colors.muted, fontSize: 15, lineHeight: 23 },
  errorText: { color: colors.danger, fontSize: 15, textAlign: 'center' },
  action: { color: colors.accent, fontSize: 15, fontWeight: '700' },
});
