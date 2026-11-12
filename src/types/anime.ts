export type Anime = {
  id: number;
  title: string;
  imageUrl: string;
  bannerUrl: string | null;
  score: number | null;
  episodes: number | null;
  duration: number | null;
  status: string | null;
  format: string | null;
  year: number | null;
  genres: string[];
  description: string | null;
};

export type AnimePageInfo = {
  total: number;
  currentPage: number;
  lastPage: number;
  hasNextPage: boolean;
};
