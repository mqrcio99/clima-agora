import { useCallback, useState } from 'react'
import { getPreferences, setPreferences } from '../services/storage.js'

export function usePreferences() {
  const [preferences, setPreferenceState] = useState(() => getPreferences())

  const updatePreferences = useCallback(nextPreferences => {
    const normalized = {
      ...getPreferences(),
      ...(nextPreferences || {}),
    }

    setPreferenceState(normalized)
    setPreferences(normalized)
  }, [])

  return { preferences, setPreferences: updatePreferences }
}
