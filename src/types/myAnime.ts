export type WatchStatus = 'watching' | 'completed' | 'planned';

export type MyAnimeEntry = {
  id: number;
  malId: number;
  title: string;
  imageUrl: string | null;
  totalEpisodes: number | null;
  status: WatchStatus;
  episodesWatched: number;
  score: number | null;
  note: string | null;
  createdAt: number;
  updatedAt: number;
};

export type EntryInput = {
  malId: number;
  title: string;
  imageUrl: string | null;
  totalEpisodes: number | null;
  status: WatchStatus;
  episodesWatched: number;
  score: number | null;
  note: string | null;
};

export const STATUS_LABELS: Record<WatchStatus, string> = {
  watching: 'Смотрю',
  completed: 'Просмотрено',
  planned: 'В планах',
};
