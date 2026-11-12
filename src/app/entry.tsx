import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
} from 'react-native';

import { EntryForm } from '../components/EntryForm';
import { getEntryById, saveEntry } from '../db/myAnimeRepo';
import { colors, radius, spacing } from '../theme/tokens';
import type { EntryInput, MyAnimeEntry } from '../types/myAnime';

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function toPositiveInt(value: string | undefined): number | null {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null;
}

export default function EntryScreen() {
  const router = useRouter();
  const db = useSQLiteContext();
  const params = useLocalSearchParams<{
    entryId?: string;
    malId?: string;
    title?: string;
    imageUrl?: string;
    totalEpisodes?: string;
  }>();

  const entryId = toPositiveInt(first(params.entryId));
  const malId = toPositiveInt(first(params.malId));
  const title = first(params.title) ?? '';
  const imageUrl = first(params.imageUrl) ?? null;
  const totalEpisodesRaw = first(params.totalEpisodes);
  const totalEpisodes =
    totalEpisodesRaw && totalEpisodesRaw !== '' ? Number(totalEpisodesRaw) : null;

  const [entry, setEntry] = useState<MyAnimeEntry | null>(null);
  const [loadingEntry, setLoadingEntry] = useState(entryId !== null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (entryId === null) {
      setLoadingEntry(false);
      return;
    }

    let active = true;
    getEntryById(db, entryId)
      .then(row => {
        if (active) setEntry(row);
      })
      .catch(() => {
        if (active) setError('Не удалось прочитать запись');
      })
      .finally(() => {
        if (active) setLoadingEntry(false);
      });

    return () => {
      active = false;
    };
  }, [db, entryId]);

  const base = entry
    ? {
        malId: entry.malId,
        title: entry.title,
        imageUrl: entry.imageUrl,
        totalEpisodes: entry.totalEpisodes,
      }
    : malId !== null && title !== ''
      ? { malId, title, imageUrl, totalEpisodes }
      : null;

  async function handleSubmit(input: EntryInput) {
    setSaving(true);
    setError(null);
    try {
      await saveEntry(db, input, entry?.id);
      router.back();
    } catch {
      setError('Не удалось сохранить запись. Попробуй ещё раз.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Stack.Screen options={{ title: entry ? 'Редактировать' : 'В мой список' }} />

        {loadingEntry ? (
          <ActivityIndicator color={colors.accent} style={styles.loader} />
        ) : base ? (
          <EntryForm base={base} initial={entry} saving={saving} onSubmit={handleSubmit} />
        ) : (
          <Text style={styles.error}>Не хватает данных о тайтле. Вернись и попробуй снова.</Text>
        )}

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable
          accessibilityRole="button"
          onPress={() => router.back()}
          style={({ pressed }) => [styles.cancel, pressed && styles.pressed]}>
          <Text style={styles.cancelText}>Отмена</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xl },
  loader: { marginVertical: spacing.xl },
  error: { color: colors.danger, fontSize: 14, lineHeight: 20 },
  cancel: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelText: { color: colors.muted, fontSize: 15, fontWeight: '600' },
  pressed: { opacity: 0.75 },
});
