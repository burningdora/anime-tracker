# Anime Tracker

Учебное мобильное приложение на **Expo / React Native / TypeScript**: каталог аниме с
[AniList GraphQL API](https://graphql.anilist.co), избранное на общем состоянии и личный список
просмотра, который хранится в **SQLite** и остаётся после перезапуска приложения.

Проект выполнен по курсу «Разработка мобильных приложений с использованием React Native»
(3 курс, Прикладная информатика).

---

## Возможности

- **Каталог** — популярные тайтлы AniList, по 18 на страницу, постеры, год, формат, число серий, оценка, жанры.
- **Поиск** — с задержкой 450 мс (debounce), чтобы не отправлять запрос на каждую букву.
- **Серверная пагинация** — «Назад» / «Далее», «Страница X из Y», кнопки блокируются на границах и во время загрузки.
- **Четыре состояния экрана** — loading, error, empty, success + pull-to-refresh и кнопка «Повторить».
- **Избранное** — `Context` + `useReducer`, один источник истины для карточки, деталей и отдельной вкладки.
- **Личный список** — статус, просмотренные серии, оценка 1–10, заметка; добавление, редактирование, удаление.
- **Детали тайтла** — постер, метаданные, жанры, описание, переход к записи.
- **Экран загрузки** — фон совпадает с фоном GIF, персонаж по центру, лоадер и название пиксельным шрифтом.

---

## Стек

| Технология | Версия / роль |
| --- | --- |
| Expo SDK | 58 |
| React Native | 0.88.1 |
| React | 19.3 |
| TypeScript | strict, без `any` |
| Expo Router | Stack, Tabs, динамический маршрут `[id]`, modal |
| AniList GraphQL | каталог, поиск, детали |
| `Context` + `useReducer` | избранное |
| `expo-sqlite` | личный список (CRUD) |
| `expo-image` | постеры, GIF |
| `@expo-google-fonts/press-start-2p` | пиксельный шрифт |

---

## Запуск

Нужны Node.js 20+ и приложение **Expo Go** на телефоне.

```bash
npm install
npm start
```

Телефон и компьютер должны быть в одной Wi-Fi-сети. Отсканируй QR-код из терминала в Expo Go.

Если компьютер не виден в локальной сети:

```bash
npx expo start --tunnel
```

Веб-версия (SQLite работает через WASM, нужен `metro.config.js`):

```bash
npx expo start --web
```

---

## Скриншоты

> Требование лабораторной №2 — скриншоты первой и второй страницы.
> Положить файлы в `docs/screenshots/` и заменить пути ниже.

| Страница 1 | Страница 2 |
| --- | --- |
| `docs/screenshots/page-1.png` | `docs/screenshots/page-2.png` |

---

## Структура

```
src/
├── app/                     маршруты Expo Router
│   ├── _layout.tsx          шрифт, splash, SQLiteProvider, FavoritesProvider, Stack
│   ├── (tabs)/
│   │   ├── _layout.tsx      нижние вкладки
│   │   ├── index.tsx        каталог
│   │   ├── favorites.tsx    избранное
│   │   └── my.tsx           мой список
│   ├── anime/[id].tsx       детали тайтла
│   └── entry.tsx            модальная форма записи
├── api/anilist.ts           GraphQL-запросы, response.ok, маппинг ответа
├── components/              AnimeCard, FavoriteButton, SearchInput,
│                            PaginationControls, EntryForm, BootSplash
├── context/                 FavoritesContext (reducer + provider)
├── db/                      схема и репозиторий SQLite
├── hooks/                   useAnimeList, useAnime, useEntry, useMyAnime,
│                            useFavorites, useDebouncedValue
├── theme/tokens.ts          цвета, отступы, радиусы
└── types/                   Anime, AnimePageInfo, MyAnimeEntry, WatchStatus

docs/
├── lab2-dummyjson-example.tsx   лабораторный экран на DummyJSON
└── screenshots/                 скриншоты для отчёта
```

---

## Как это работает

### Поток данных

```
событие → setState → render → useEffect → fetch/SQLite → setState → render
```

| Экран | Цепочка |
| --- | --- |
| Каталог | `CatalogScreen → useAnimeList → getAnimePage → AniList` |
| Детали | `AnimeDetails → useAnime(id) → getAnimeById → AniList` |
| Избранное | `FavoriteButton → dispatch → reducer → Context → все consumers` |
| Мой список | `MyAnimeScreen → useMyAnime → getEntries → SQLite` |
| Форма | `EntryForm → saveEntry → INSERT/UPDATE → повторный SELECT` |

### Загрузка каталога

`useAnimeList` держит `anime`, `pageInfo`, `loading`, `error` и `reloadKey`.
`useEffect` с зависимостями `[page, search, reloadKey]` создаёт `AbortController`, сбрасывает
`loading` и `error`, выполняет запрос и в `cleanup` отменяет его. Поэтому быстрый переход между
страницами не приводит к «устаревшему» ответу на экране.

### Пагинация

AniList использует `page` / `perPage` и возвращает `pageInfo { total, currentPage, lastPage }`.
Номер страницы — единственное состояние; `totalPages` не хранится, а берётся из `lastPage`.
Кнопки используют functional update: `setPage(prev => prev + 1)`.

### Избранное

`favoritesReducer` — чистая функция с действиями `add`, `remove`, `clear`; массивы не мутируются.
`add` отсекает дубликаты. Контекст обновляет карточку, детали и вкладку «Избранное» одновременно.

### Личный список

Таблица `my_anime` создаётся в `initDatabase` (`CREATE TABLE IF NOT EXISTS`), поле `mal_id` уникально.
`saveEntry` делает `UPDATE`, если запись уже есть, иначе `INSERT`. Все значения передаются
параметрами `?`. `useFocusEffect` перечитывает таблицу при возврате на вкладку.

### Экран загрузки

Нативный splash из `app.json` (фон `#000004`, `splash-character.png`) держится, пока не загрузится
шрифт. Затем поверх приложения рисуется `BootSplash`: персонаж по центру, над ним полоска загрузки
и название `ANIME TRACKER` шрифтом Press Start 2P. Через 2.4 с экран гаснет за 450 мс.

---

## Лабораторная №2

Механика лабораторной — `useState` → `useEffect` → `fetch` → `response.ok` → loading/error/empty/success
→ серверная пагинация → `AbortController` — реализована в `useAnimeList` и `api/anilist.ts`.

Финальный проект использует AniList GraphQL (`page`/`perPage`), а лабораторный вариант на DummyJSON
(`limit`/`skip`, `ScrollView` + `map()`, `SafeAreaView`) лежит в
[`docs/lab2-dummyjson-example.tsx`](docs/lab2-dummyjson-example.tsx). Его можно скопировать в
`src/app/lab2.tsx` и открыть по маршруту `/lab2`.

| Требование | Где реализовано |
| --- | --- |
| `fetch` внутри `useEffect` | `src/hooks/useAnimeList.ts` |
| `useState`: данные, loading, error, page, total | `useAnimeList`, `useState` в экране каталога |
| проверка `response.ok` | `src/api/anilist.ts` |
| серверная пагинация | `getAnimePage(page, perPage)`, `pageInfo` |
| 4 состояния UI | `src/app/(tabs)/index.tsx` |
| `setPage(prev => …)`, disabled | `PaginationControls`, `index.tsx` |
| `AbortController` в cleanup | `useAnimeList` |
| карточка отдельным компонентом | `src/components/AnimeCard.tsx` |
| типы без `any`, `StyleSheet.create` | `src/types/*`, все компоненты |

---

## Материалы курса

Конспекты всех семи лекций курса лежат в [`docs/course/`](docs/course/). Там же таблица
«лекция → файлы проекта» и краткие тезисы по каждой теме.

---

## Проверки

```bash
npx tsc --noEmit                    # 0 ошибок
npx expo-doctor                     # 20/20
npx expo export --platform android  # бандл собирается
```

---

## Автор

Берлинская Дарья, IA-2404.
