import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing } from '../theme/tokens';

type Props = {
  page: number;
  totalPages: number;
  disabled?: boolean;
  onPrev: () => void;
  onNext: () => void;
};

export function PaginationControls({ page, totalPages, disabled, onPrev, onNext }: Props) {
  const prevDisabled = disabled || page <= 1;
  const nextDisabled = disabled || page >= totalPages;

  return (
    <View style={styles.row}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Предыдущая страница"
        disabled={prevDisabled}
        onPress={onPrev}
        style={({ pressed }) => [
          styles.button,
          prevDisabled && styles.disabled,
          pressed && !prevDisabled && styles.pressed,
        ]}>
        <Text style={styles.buttonText}>←</Text>
      </Pressable>

      <Text style={styles.counter}>
        Страница {page} из {Math.max(totalPages, 1)}
      </Text>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Следующая страница"
        disabled={nextDisabled}
        onPress={onNext}
        style={({ pressed }) => [
          styles.button,
          nextDisabled && styles.disabled,
          pressed && !nextDisabled && styles.pressed,
        ]}>
        <Text style={styles.buttonText}>→</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  button: {
    width: 44,
    height: 40,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pressed: { opacity: 0.7 },
  disabled: { opacity: 0.35 },
  buttonText: { color: colors.text, fontSize: 18 },
  counter: { color: colors.muted, fontSize: 14, paddingHorizontal: spacing.sm },
});
