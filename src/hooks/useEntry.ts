import { useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';

import { getEntryByMalId } from '../db/myAnimeRepo';
import type { MyAnimeEntry } from '../types/myAnime';

export function useEntry(malId: number | null) {
  const db = useSQLiteContext();
  const [entry, setEntry] = useState<MyAnimeEntry | null>(null);
  const [loading, setLoading] = useState(malId !== null);

  useFocusEffect(
    useCallback(() => {
      if (malId === null) {
        setEntry(null);
        setLoading(false);
        return;
      }

      let active = true;
      setLoading(true);

      getEntryByMalId(db, malId)
        .then(row => {
          if (active) setEntry(row);
        })
        .catch(() => {
          if (active) setEntry(null);
        })
        .finally(() => {
          if (active) setLoading(false);
        });

      return () => {
        active = false;
      };
    }, [db, malId]),
  );

  return { entry, loading };
}
