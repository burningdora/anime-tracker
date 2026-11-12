import { useEffect, useState } from 'react';

import { getAnimePage } from '../api/anilist';
import type { Anime, AnimePageInfo } from '../types/anime';

export function useAnimeList(search: string, page: number) {
  const [anime, setAnime] = useState<Anime[]>([]);
  const [pageInfo, setPageInfo] = useState<AnimePageInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    setLoading(true);
    setError(null);

    getAnimePage(page, search, controller.signal)
      .then(result => {
        if (!active) return;
        setAnime(result.anime);
        setPageInfo(result.pageInfo);
      })
      .catch(() => {
        // Отмена запроса — не ошибка для пользователя.
        if (!active || controller.signal.aborted) return;
        setError('Не удалось загрузить каталог. Проверь интернет и попробуй снова.');
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
        setRefreshing(false);
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [page, search, reloadKey]);

  function retry() {
    setReloadKey(value => value + 1);
  }

  function refresh() {
    setRefreshing(true);
    setReloadKey(value => value + 1);
  }

  return { anime, pageInfo, loading, refreshing, error, retry, refresh };
}
