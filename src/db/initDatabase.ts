import type { SQLiteDatabase } from 'expo-sqlite';

export async function initDatabase(db: SQLiteDatabase) {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS my_anime (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      mal_id INTEGER NOT NULL UNIQUE,
      title TEXT NOT NULL,
      image_url TEXT,
      total_episodes INTEGER,
      status TEXT NOT NULL,
      episodes_watched INTEGER NOT NULL DEFAULT 0,
      score REAL,
      note TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );
  `);
}
