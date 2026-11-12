# Материалы курса

Конспекты лекций курса «Разработка мобильных приложений с использованием React Native»
(3 курс, Прикладная информатика, осень 2026).

| № | Файл | Тема |
| --- | --- | --- |
| 1 | `Lecture_01_React_Native_Introduction_2026.docx` | Введение в мобильную разработку и React Native |
| 2 | `Lecture_02_React_Native_State_Effects_Data_2026.docx` | State, Effects и данные: `useState` → `useEffect` → `fetch` → пагинация |
| 3 | `Lecture_03_React_Native_Lists_Inputs_Forms_2026_resend.docx` | Списки, пользовательский ввод и формы |
| 4 | `Lecture_04_React_Native_Expo_Router_Navigation_2026.docx` | Навигация и многоэкранные приложения на Expo Router |
| 5 | `Lecture_05_React_Native_Architecture_Clean_Code_2026.docx` | Архитектура и чистая организация кода |
| 6 | `Lecture_06_React_Native_Shared_State_Context_useReducer.docx` | Общее состояние: `useReducer` и `Context` |
| 7 | `Lecture_07_React_Native_Local_Storage_SQLite_2026.docx` | Локальное хранение данных и SQLite |

> В старых файлах лекция про state/effects называлась `Lecture_03`. В актуальном наборе это
> **лекция 2**, а `Lecture_03` — про списки и формы.

---

## Лекция → файлы проекта

| Лекция | Что разбирается | Где это в проекте |
| --- | --- | --- |
| **1** | Native / cross-platform / hybrid / PWA; React Native vs React для web; Expo SDK; Metro; структура проекта; первый экран | `package.json`, `app.json`, `tsconfig.json`, `metro.config.js`, `src/app/_layout.tsx` |
| **2** | `useState`, snapshot, functional update, derived state; `useEffect`, зависимости, cleanup; `fetch`, `response.ok`; loading/error/empty/success; `limit`/`skip`; `AbortController` | `src/hooks/useAnimeList.ts`, `src/api/anilist.ts`, `src/app/(tabs)/index.tsx`, `src/components/PaginationControls.tsx`, `src/hooks/useDebouncedValue.ts` |
| **3** | `FlatList`: `data`, `renderItem`, `keyExtractor`, `ListHeader/Empty/Separator`, `RefreshControl`; `TextInput`, `keyboardType`, `KeyboardAvoidingView`; форма, валидация, submit | `src/components/AnimeCard.tsx`, `src/app/(tabs)/index.tsx`, `src/components/SearchInput.tsx`, `src/components/EntryForm.tsx`, `src/app/entry.tsx` |
| **4** | File-based routing, `_layout.tsx`, `Stack`, `Link` / `useRouter`, `push` / `back` / `replace`, `[id]`, `useLocalSearchParams`, route groups `(tabs)`, `Tabs`, modal | `src/app/_layout.tsx`, `src/app/(tabs)/_layout.tsx`, `src/app/anime/[id].tsx`, `src/app/entry.tsx`, `src/components/AnimeCard.tsx` (Link), `src/app/(tabs)/my.tsx` (useRouter) |
| **5** | Ответственности: route/screen, UI-компонент, custom hook, API-функция; где хранить state; `AbortController` в хуке; «props вниз, callbacks вверх»; без преждевременных абстракций | `src/app/*` — тонкие экраны; `src/components/*` — только UI; `src/hooks/*` — state + effect; `src/api/anilist.ts` — HTTP без React; `src/db/*` — SQL |
| **6** | Local vs shared state, lifting state up, prop drilling; `useReducer`, action, чистый reducer, immutable update, `dispatch`; `createContext`, Provider, `useContext`; React 19 | `src/context/FavoritesContext.tsx`, `src/hooks/useFavorites.ts`, `src/components/FavoriteButton.tsx`, `src/app/(tabs)/favorites.tsx`, `src/app/_layout.tsx` |
| **7** | Persistence; key-value / SecureStore / FileSystem / SQLite; таблица, строка, колонка, primary key; CRUD; SQL-параметры; `SQLiteProvider`, `useSQLiteContext`, `execAsync`, `runAsync`, `getAllAsync`, `getFirstAsync`; SELECT → state → render | `src/db/initDatabase.ts`, `src/db/myAnimeRepo.ts`, `src/hooks/useMyAnime.ts`, `src/hooks/useEntry.ts`, `src/app/(tabs)/my.tsx`, `src/app/entry.tsx` |

---

## Ключевые тезисы по лекциям

### 1. Введение

- React Native — cross-platform: один JS/TS-код, но нативные компоненты, а не DOM.
- Вместо `div`, `p`, `img` — `View`, `Text`, `Image`; вместо CSS — `StyleSheet` и Flexbox.
- Expo — SDK и инструменты поверх React Native; Expo Go позволяет запускать приложение без нативной сборки.
- Metro — сборщик: транспилирует TS/JSX, собирает бандл, отдаёт его по сети, делает Fast Refresh.
- `app.json` — конфиг приложения, `package.json` — зависимости и скрипты.

### 2. State, Effects и данные

- `setState` не меняет переменную сразу — он запрашивает новый render; state в обработчике — snapshot.
- Functional update нужен, когда новое значение зависит от предыдущего.
- Derived state вычисляется в render (`totalPages`, `meta`, `percent`), а не хранится.
- `useEffect` синхронизирует с внешней системой; зависимости — все reactive values, которые он читает.
- Cleanup отменяет то, что сделал setup: `AbortController.abort()`, `clearTimeout`.
- `fetch` не отклоняется на HTTP 404/500 — нужна проверка `response.ok`.

### 3. Списки, ввод и формы

- `FlatList` виртуализирует список: рендерит только видимые элементы, поэтому лучше `ScrollView` + `map()` для длинных коллекций.
- `keyExtractor` — стабильный ключ; `ListHeaderComponent`, `ListEmptyComponent`, `ItemSeparatorComponent` — части списка.
- `RefreshControl` даёт pull-to-refresh.
- `TextInput` — controlled: `value` + `onChangeText`.
- `KeyboardAvoidingView` и `keyboardShouldPersistTaps` — клавиатура не перекрывает форму.
- Валидация — вычисление из полей, а не отдельный state; submit проверяет значения и вызывает API.

### 4. Expo Router

- Файл в `src/app` — маршрут; папка — сегмент URL.
- `_layout.tsx` описывает общий каркас; `Stack` хранит историю, `Tabs` переключает разделы.
- `Link` — декларативный переход, `useRouter` — императивный.
- `push` добавляет экран в историю, `back` возвращает, `replace` заменяет текущий.
- `[id].tsx` — динамический маршрут; `useLocalSearchParams` читает параметр.
- `(tabs)` — route group: не появляется в URL.
- `presentation: 'modal'` показывает маршрут как модальное окно.
- Навигация не заменяет state: форма в модалке живёт, пока экран смонтирован.

### 5. Архитектура

- Route/screen — композиция, а не место для HTTP и бизнес-логики.
- UI-компонент получает props и вызывает callbacks; сам ничего не запрашивает.
- Custom hook — React-логика: state, effect, cleanup.
- API-функция — HTTP и маппинг, без `useState` и без React.
- `AbortController` создаётся в хуке: отмена привязана к жизненному циклу компонента.
- «Props вниз, callbacks вверх».
- Не абстрагировать раньше времени: универсальный `useApi` часто вреден.

### 6. Context и useReducer

- Local state — у компонента; shared state — у общего предка (lifting state up).
- Prop drilling — передача props через много уровней; Context решает это.
- Reducer — чистая функция `(state, action) => nextState`; state не мутируется.
- `dispatch` стабилен между render, поэтому его можно не добавлять в зависимости.
- `createContext` создаёт канал; Provider кладёт значение; `useContext` подписывается.
- В React 19 можно писать `<FavoritesContext value={...}>` вместо `.Provider`.
- Context — не база данных и не глобальный store: он живёт в памяти и исчезает при перезапуске.

### 7. SQLite

- `useState`/`useReducer` — не persistent storage: при перезапуске данные теряются.
- Способы хранения: key-value, SecureStore, FileSystem, SQLite.
- Реляционная модель: database → table → row → column; primary key уникален.
- CRUD: `INSERT`, `SELECT`, `UPDATE`, `DELETE`; `WHERE` выбирает строки.
- SQL-параметры `?` защищают от инъекций и корректно экранируют значения.
- `SQLiteProvider` открывает базу и вызывает `onInit`; `useSQLiteContext()` даёт объект базы.
- `execAsync` — несколько команд без параметров (DDL, `PRAGMA`); `runAsync` — один запрос с параметрами.
- `getAllAsync` — массив строк, `getFirstAsync` — одна строка или `null`.
- SQLite не вызывает React render: после записи нужно снова выполнить `SELECT` и обновить state.

---

## Чего в проекте нет (и почему)

| Из лекции | Почему нет |
| --- | --- |
| `SectionList` | данные каталога плоские, группировать нечего |
| `onEndReached` / infinite scroll | по заданию пагинация кнопками, так нагляднее |
| `SecureStore`, `FileSystem` | в проекте нет токенов и файлов пользователя |
| `useReducer` с `init` | начальное состояние — пустой массив, инициализатор не нужен |
| миграции БД | одна таблица, достаточно `CREATE TABLE IF NOT EXISTS` |
| SQLite Inspector | инструмент разработчика, в приложении не нужен |

---

Материалы используются в учебных целях. Права принадлежат автору курса.
