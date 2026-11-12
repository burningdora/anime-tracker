import { useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';

import { deleteEntry, getEntries } from '../db/myAnimeRepo';
import type { MyAnimeEntry } from '../types/myAnime';

export function useMyAnime() {
  const db = useSQLiteContext();
  const [entries, setEntries] = useState<MyAnimeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const rows = await getEntries(db);
      setEntries(rows);
    } catch {
      setError('Не удалось прочитать локальный список');
    } finally {
      setLoading(false);
    }
  }, [db]);

  // Экран перечитывает таблицу при каждом возврате на вкладку,
  // потому что SQLite сам не обновляет React state.
  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const remove = useCallback(
    async (id: number) => {
      setError(null);
      try {
        await deleteEntry(db, id);
        await load();
        return true;
      } catch {
        setError('Не удалось удалить запись');
        return false;
      }
    },
    [db, load],
  );

  return { entries, loading, error, reload: load, remove };
}
