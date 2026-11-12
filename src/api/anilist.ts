import type { Anime, AnimePageInfo } from '../types/anime';

const ENDPOINT = 'https://graphql.anilist.co';

// AniList отдаёт 50 тайтлов на страницу максимум; 18 удобно смотрится в списке.
export const ANIME_PAGE_SIZE = 18;

const MEDIA_FIELDS = `
  id
  title { romaji english }
  coverImage { large extraLarge }
  bannerImage
  averageScore
  episodes
  duration
  status
  format
  seasonYear
  genres
  description
`;

const PAGE_QUERY = `
  query AnimePage($page: Int!, $perPage: Int!, $search: String) {
    Page(page: $page, perPage: $perPage) {
      pageInfo { total currentPage lastPage hasNextPage }
      media(type: ANIME, search: $search, sort: POPULARITY_DESC) {
        ${MEDIA_FIELDS}
      }
    }
  }
`;

const DETAIL_QUERY = `
  query AnimeById($id: Int!) {
    Media(id: $id, type: ANIME) {
      ${MEDIA_FIELDS}
    }
  }
`;

type RawTitle = { romaji: string | null; english: string | null };

type RawMedia = {
  id: number;
  title: RawTitle;
  coverImage: { large: string | null; extraLarge: string | null } | null;
  bannerImage: string | null;
  averageScore: number | null;
  episodes: number | null;
  duration: number | null;
  status: string | null;
  format: string | null;
  seasonYear: number | null;
  genres: string[] | null;
  description: string | null;
};

type GraphQLResponse<T> = {
  data?: T;
  errors?: { message: string; status?: number }[];
};

async function request<T>(
  query: string,
  variables: Record<string, unknown>,
  signal?: AbortSignal,
): Promise<T> {
  const response = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ query, variables }),
    signal,
  });

  if (!response.ok) {
    throw new Error(`AniList HTTP ${response.status}`);
  }

  const payload = (await response.json()) as GraphQLResponse<T>;

  if (payload.errors?.length) {
    const notFound = payload.errors.some(
      error => error.status === 404 || /not found/i.test(error.message),
    );
    throw new Error(notFound ? 'NOT_FOUND' : payload.errors[0].message);
  }

  if (!payload.data) {
    throw new Error('AniList вернул пустой ответ');
  }

  return payload.data;
}

function stripHtml(value: string | null): string | null {
  if (!value) return null;
  return value
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function mapMedia(raw: RawMedia): Anime {
  return {
    id: raw.id,
    title: raw.title.english ?? raw.title.romaji ?? `Anime #${raw.id}`,
    imageUrl: raw.coverImage?.extraLarge ?? raw.coverImage?.large ?? '',
    bannerUrl: raw.bannerImage,
    // averageScore приходит как 0–100, в UI показываем привычную оценку 0–10.
    score: raw.averageScore == null ? null : Math.round(raw.averageScore) / 10,
    episodes: raw.episodes,
    duration: raw.duration,
    status: raw.status,
    format: raw.format,
    year: raw.seasonYear,
    genres: raw.genres ?? [],
    description: stripHtml(raw.description),
  };
}

export async function getAnimePage(
  page: number,
  search: string,
  signal?: AbortSignal,
): Promise<{ anime: Anime[]; pageInfo: AnimePageInfo }> {
  const trimmed = search.trim();
  const data = await request<{
    Page: { pageInfo: AnimePageInfo; media: RawMedia[] };
  }>(PAGE_QUERY, { page, perPage: ANIME_PAGE_SIZE, search: trimmed || null }, signal);

  return {
    anime: data.Page.media.map(mapMedia),
    pageInfo: data.Page.pageInfo,
  };
}

export async function getAnimeById(id: number, signal?: AbortSignal): Promise<Anime> {
  const data = await request<{ Media: RawMedia | null }>(DETAIL_QUERY, { id }, signal);

  if (!data.Media) {
    throw new Error('NOT_FOUND');
  }

  return mapMedia(data.Media);
}
