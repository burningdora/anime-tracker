import { useContext } from 'react';

import { FavoritesContext, type FavoritesContextValue } from '../context/FavoritesContext';

export function useFavorites(): FavoritesContextValue {
  const context = useContext(FavoritesContext);

  if (context === null) {
    throw new Error('useFavorites должен вызываться внутри FavoritesProvider');
  }

  return context;
}
