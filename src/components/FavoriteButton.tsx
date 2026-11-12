import { Pressable, StyleSheet, Text } from 'react-native';

import { useFavorites } from '../hooks/useFavorites';
import { colors } from '../theme/tokens';
import type { Anime } from '../types/anime';

type Props = {
  anime: Anime;
  size?: number;
};

export function FavoriteButton({ anime, size = 20 }: Props) {
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const favorite = isFavorite(anime.id);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={favorite ? 'Убрать из избранного' : 'Добавить в избранное'}
      hitSlop={10}
      onPress={() => (favorite ? removeFavorite(anime.id) : addFavorite(anime))}
      style={({ pressed }) => [styles.button, favorite && styles.active, pressed && styles.pressed]}>
      <Text style={[styles.icon, { fontSize: size }, favorite && styles.iconActive]}>
        {favorite ? '♥' : '♡'}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(14, 16, 22, 0.72)',
    borderWidth: 1,
    borderColor: colors.border,
  },
  active: { borderColor: colors.accent, backgroundColor: colors.accentSoft },
  pressed: { opacity: 0.7 },
  icon: { color: colors.text, lineHeight: 26 },
  iconActive: { color: colors.accent },
});
