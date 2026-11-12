import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { colors, radius, spacing } from '../theme/tokens';

type Props = {
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
};

export function SearchInput({ value, onChangeText, placeholder = 'Поиск по названию' }: Props) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.icon}>⌕</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        style={styles.input}
        autoCorrect={false}
        returnKeyType="search"
        accessibilityLabel="Поиск аниме"
      />
      {value.length > 0 ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Очистить поиск"
          hitSlop={10}
          onPress={() => onChangeText('')}>
          <Text style={styles.clear}>✕</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
  },
  icon: { color: colors.muted, fontSize: 18 },
  input: { flex: 1, color: colors.text, fontSize: 16, paddingVertical: 12 },
  clear: { color: colors.muted, fontSize: 16, paddingHorizontal: 4 },
});
