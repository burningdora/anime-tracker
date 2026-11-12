import { useEffect, useState } from 'react';

import { getAnimeById } from '../api/anilist';
import type { Anime } from '../types/anime';

export function useAnime(id: number | null) {
  const [anime, setAnime] = useState<Anime | null>(null);
  const [loading, setLoading] = useState(id !== null);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (id === null) {
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    let active = true;

    setLoading(true);
    setError(null);

    getAnimeById(id, controller.signal)
      .then(result => {
        if (!active) return;
        setAnime(result);
      })
      .catch(cause => {
        if (!active || controller.signal.aborted) return;
        setError(
          cause instanceof Error && cause.message === 'NOT_FOUND'
            ? 'Тайтл не найден'
            : 'Не удалось загрузить информацию о тайтле',
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [id, reloadKey]);

  function retry() {
    setReloadKey(value => value + 1);
  }

  return { anime, loading, error, retry };
}
