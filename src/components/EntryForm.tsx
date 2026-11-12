import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { colors, radius, spacing } from '../theme/tokens';
import { STATUS_LABELS, type EntryInput, type MyAnimeEntry, type WatchStatus } from '../types/myAnime';

type Base = {
  malId: number;
  title: string;
  imageUrl: string | null;
  totalEpisodes: number | null;
};

type Props = {
  base: Base;
  initial: MyAnimeEntry | null;
  saving: boolean;
  onSubmit: (input: EntryInput) => void | Promise<void>;
};

const STATUSES: WatchStatus[] = ['watching', 'completed', 'planned'];

export function EntryForm({ base, initial, saving, onSubmit }: Props) {
  const [status, setStatus] = useState<WatchStatus>(initial?.status ?? 'watching');
  const [episodes, setEpisodes] = useState(String(initial?.episodesWatched ?? 0));
  const [score, setScore] = useState(initial?.score != null ? String(initial.score) : '');
  const [note, setNote] = useState(initial?.note ?? '');
  const [submitted, setSubmitted] = useState(false);

  const total = base.totalEpisodes;
  const episodesTrimmed = episodes.trim();
  const episodesNumber = Number(episodesTrimmed);
  const scoreTrimmed = score.trim().replace(',', '.');
  const scoreNumber = scoreTrimmed === '' ? null : Number(scoreTrimmed);

  // Derived values: ошибки не хранятся в state, а вычисляются из полей.
  const episodesError =
    episodesTrimmed === '' || !/^\d+$/.test(episodesTrimmed)
      ? 'Введи целое число серий'
      : total != null && total > 0 && episodesNumber > total
        ? `Не больше ${total} серий`
        : null;

  const scoreError =
    scoreTrimmed !== '' &&
    (scoreNumber === null || !Number.isFinite(scoreNumber) || scoreNumber < 1 || scoreNumber > 10)
      ? 'Оценка от 1 до 10'
      : null;

  const noteError = note.length > 300 ? 'Максимум 300 символов' : null;

  async function handlePress() {
    if (episodesError || scoreError || noteError) {
      setSubmitted(true);
      return;
    }

    await onSubmit({
      malId: base.malId,
      title: base.title,
      imageUrl: base.imageUrl,
      totalEpisodes: base.totalEpisodes,
      status,
      episodesWatched: episodesNumber,
      score: scoreNumber,
      note: note.trim() === '' ? null : note.trim(),
    });
  }

  return (
    <View style={styles.form}>
      <Text style={styles.caption} numberOfLines={2}>
        {base.title}
      </Text>

      <Text style={styles.label}>Статус</Text>
      <View style={styles.statusRow}>
        {STATUSES.map(value => {
          const active = status === value;
          return (
            <Pressable
              key={value}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              onPress={() => setStatus(value)}
              style={[styles.statusButton, active && styles.statusButtonActive]}>
              <Text style={[styles.statusText, active && styles.statusTextActive]}>
                {STATUS_LABELS[value]}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.label}>Просмотрено серий</Text>
      <TextInput
        value={episodes}
        onChangeText={setEpisodes}
        keyboardType="number-pad"
        style={styles.input}
        placeholder="0"
        placeholderTextColor={colors.muted}
        accessibilityLabel="Просмотрено серий"
      />
      <Text style={styles.hint}>
        {total != null && total > 0 ? `Всего серий: ${total}` : 'Количество серий неизвестно'}
      </Text>
      {submitted && episodesError ? <Text style={styles.error}>{episodesError}</Text> : null}

      <Text style={styles.label}>Оценка (1–10)</Text>
      <TextInput
        value={score}
        onChangeText={setScore}
        keyboardType="decimal-pad"
        style={styles.input}
        placeholder="Необязательно"
        placeholderTextColor={colors.muted}
        accessibilityLabel="Оценка от 1 до 10"
      />
      {submitted && scoreError ? <Text style={styles.error}>{scoreError}</Text> : null}

      <Text style={styles.label}>Заметка</Text>
      <TextInput
        value={note}
        onChangeText={setNote}
        style={[styles.input, styles.noteInput]}
        placeholder="Что запомнилось?"
        placeholderTextColor={colors.muted}
        multiline
        textAlignVertical="top"
        accessibilityLabel="Заметка"
      />
      {submitted && noteError ? <Text style={styles.error}>{noteError}</Text> : null}

      <Pressable
        accessibilityRole="button"
        disabled={saving}
        onPress={() => {
          void handlePress();
        }}
        style={({ pressed }) => [styles.submit, (saving || pressed) && styles.pressed]}>
        <Text style={styles.submitText}>{saving ? 'Сохранение…' : 'Сохранить'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  form: { gap: spacing.sm },
  caption: { fontSize: 22, fontWeight: '700', color: colors.text, lineHeight: 28 },
  label: { fontSize: 13, color: colors.muted, marginTop: spacing.sm, textTransform: 'uppercase', letterSpacing: 0.6 },
  statusRow: { flexDirection: 'row', gap: spacing.sm },
  statusButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
  },
  statusButtonActive: { borderColor: colors.accent, backgroundColor: colors.accentSoft },
  statusText: { color: colors.muted, fontSize: 13, fontWeight: '600' },
  statusTextActive: { color: colors.text },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    color: colors.text,
    fontSize: 16,
  },
  noteInput: { minHeight: 96 },
  hint: { color: colors.muted, fontSize: 12 },
  error: { color: colors.danger, fontSize: 13 },
  submit: {
    marginTop: spacing.lg,
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    paddingVertical: 15,
    alignItems: 'center',
  },
  submitText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  pressed: { opacity: 0.75 },
});
