import { useCallback, useState } from 'react'
import { getFavorites, setFavorites } from '../services/storage.js'

export function useFavorites() {
  const [favorites, setFavoriteState] = useState(() => getFavorites())

  const updateFavorites = useCallback(nextFavorites => {
    const normalized = Array.isArray(nextFavorites) ? nextFavorites : []
    setFavoriteState(normalized)
    setFavorites(normalized)
  }, [])

  return { favorites, setFavorites: updateFavorites }
}
