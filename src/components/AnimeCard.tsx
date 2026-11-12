import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing } from '../theme/tokens';
import type { Anime } from '../types/anime';
import { FavoriteButton } from './FavoriteButton';

export function AnimeCard({ anime }: { anime: Anime }) {
  const meta = [anime.year, anime.format, anime.episodes ? `${anime.episodes} эп.` : null]
    .filter(Boolean)
    .join(' • ');

  return (
    <View style={styles.wrapper}>
      <Link href={{ pathname: '/anime/[id]', params: { id: anime.id } }} asChild>
        <Pressable style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
          <Image
            source={anime.imageUrl ? { uri: anime.imageUrl } : undefined}
            style={styles.poster}
            contentFit="cover"
            transition={150}
          />
          <View style={styles.body}>
            <Text style={styles.title} numberOfLines={2}>
              {anime.title}
            </Text>
            {meta ? <Text style={styles.meta}>{meta}</Text> : null}
            {anime.score !== null ? (
              <View style={styles.scoreRow}>
                <Text style={styles.star}>★</Text>
                <Text style={styles.score}>{anime.score.toFixed(1)}</Text>
              </View>
            ) : null}
            {anime.genres.length > 0 ? (
              <View style={styles.genres}>
                {anime.genres.slice(0, 2).map(genre => (
                  <Text key={genre} style={styles.genre}>
                    {genre}
                  </Text>
                ))}
              </View>
            ) : null}
          </View>
        </Pressable>
      </Link>
      <View style={styles.favorite}>
        <FavoriteButton anime={anime} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { position: 'relative' },
  card: {
    flexDirection: 'row',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  pressed: { opacity: 0.8 },
  poster: {
    width: 92,
    height: 132,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceAlt,
  },
  body: { flex: 1, gap: spacing.xs, paddingRight: 36 },
  title: { fontSize: 17, fontWeight: '700', color: colors.text, lineHeight: 22 },
  meta: { fontSize: 13, color: colors.muted },
  scoreRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  star: { color: colors.warning, fontSize: 14 },
  score: { color: colors.warning, fontSize: 14, fontWeight: '700' },
  genres: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 'auto' },
  genre: {
    fontSize: 11,
    color: colors.accent,
    backgroundColor: colors.accentSoft,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    overflow: 'hidden',
  },
  favorite: { position: 'absolute', top: spacing.lg, right: spacing.lg },
});
