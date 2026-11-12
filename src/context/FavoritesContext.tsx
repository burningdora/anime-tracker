import { createContext, useReducer, type ReactNode } from 'react';

import type { Anime } from '../types/anime';

type FavoritesAction =
  | { type: 'add'; anime: Anime }
  | { type: 'remove'; id: number }
  | { type: 'clear' };

export function favoritesReducer(state: Anime[], action: FavoritesAction): Anime[] {
  switch (action.type) {
    case 'add': {
      if (state.some(item => item.id === action.anime.id)) return state;
      return [...state, action.anime];
    }
    case 'remove':
      return state.filter(item => item.id !== action.id);
    case 'clear':
      return [];
    default:
      return state;
  }
}

export type FavoritesContextValue = {
  favorites: Anime[];
  addFavorite: (anime: Anime) => void;
  removeFavorite: (id: number) => void;
  clearFavorites: () => void;
  isFavorite: (id: number) => boolean;
};

export const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, dispatch] = useReducer(favoritesReducer, []);

  function addFavorite(anime: Anime) {
    dispatch({ type: 'add', anime });
  }

  function removeFavorite(id: number) {
    dispatch({ type: 'remove', id });
  }

  function clearFavorites() {
    dispatch({ type: 'clear' });
  }

  function isFavorite(id: number) {
    return favorites.some(item => item.id === id);
  }

  return (
    <FavoritesContext value={{ favorites, addFavorite, removeFavorite, clearFavorites, isFavorite }}>
      {children}
    </FavoritesContext>
  );
}
