import type { SQLiteDatabase } from 'expo-sqlite';

import type { EntryInput, MyAnimeEntry, WatchStatus } from '../types/myAnime';

type MyAnimeRow = {
  id: number;
  mal_id: number;
  title: string;
  image_url: string | null;
  total_episodes: number | null;
  status: string;
  episodes_watched: number;
  score: number | null;
  note: string | null;
  created_at: number;
  updated_at: number;
};

function toStatus(value: string): WatchStatus {
  if (value === 'completed' || value === 'planned') return value;
  return 'watching';
}

function mapRow(row: MyAnimeRow): MyAnimeEntry {
  return {
    id: row.id,
    malId: row.mal_id,
    title: row.title,
    imageUrl: row.image_url,
    totalEpisodes: row.total_episodes,
    status: toStatus(row.status),
    episodesWatched: row.episodes_watched,
    score: row.score,
    note: row.note,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getEntries(db: SQLiteDatabase): Promise<MyAnimeEntry[]> {
  const rows = await db.getAllAsync<MyAnimeRow>(
    'SELECT * FROM my_anime ORDER BY updated_at DESC, id DESC',
  );
  return rows.map(mapRow);
}

export async function getEntryByMalId(
  db: SQLiteDatabase,
  malId: number,
): Promise<MyAnimeEntry | null> {
  const row = await db.getFirstAsync<MyAnimeRow>(
    'SELECT * FROM my_anime WHERE mal_id = ?',
    malId,
  );
  return row ? mapRow(row) : null;
}

export async function getEntryById(
  db: SQLiteDatabase,
  id: number,
): Promise<MyAnimeEntry | null> {
  const row = await db.getFirstAsync<MyAnimeRow>('SELECT * FROM my_anime WHERE id = ?', id);
  return row ? mapRow(row) : null;
}

async function updateEntry(
  db: SQLiteDatabase,
  id: number,
  input: EntryInput,
): Promise<number> {
  await db.runAsync(
    `UPDATE my_anime
       SET status = ?, episodes_watched = ?, score = ?, note = ?, updated_at = ?
     WHERE id = ?`,
    [input.status, input.episodesWatched, input.score, input.note, Date.now(), id],
  );
  return id;
}

export async function saveEntry(
  db: SQLiteDatabase,
  input: EntryInput,
  id?: number,
): Promise<number> {
  if (id != null) {
    return updateEntry(db, id, input);
  }

  // Один тайтл — одна запись: если он уже есть, обновляем её.
  const existing = await getEntryByMalId(db, input.malId);
  if (existing) {
    return updateEntry(db, existing.id, input);
  }

  const now = Date.now();
  const result = await db.runAsync(
    `INSERT INTO my_anime
       (mal_id, title, image_url, total_episodes, status, episodes_watched, score, note, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      input.malId,
      input.title,
      input.imageUrl,
      input.totalEpisodes,
      input.status,
      input.episodesWatched,
      input.score,
      input.note,
      now,
      now,
    ],
  );

  return result.lastInsertRowId;
}

export async function deleteEntry(db: SQLiteDatabase, id: number): Promise<void> {
  await db.runAsync('DELETE FROM my_anime WHERE id = ?', id);
}
