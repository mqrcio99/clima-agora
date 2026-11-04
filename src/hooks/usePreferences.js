import { createContext, createElement, useCallback, useContext, useState } from 'react'
import { localPreferencesRepository } from '../services/preferencesRepository.js'

const PreferencesContext = createContext(null)

export function PreferencesProvider({ children, repository = localPreferencesRepository }) {
  const [preferences, setPreferencesState] = useState(() => repository.read())

  const setPreferences = useCallback(
    nextPreferences => {
      setPreferencesState(currentPreferences => {
        const basePreferences = currentPreferences ?? repository.read()
        const updated = repository.save({ ...basePreferences, ...(nextPreferences || {}) })
        return updated
      })
    },
    [repository],
  )

  const resetPreferences = useCallback(() => {
    setPreferencesState(() => repository.reset())
  }, [repository])

  return createElement(
    PreferencesContext.Provider,
    { value: { preferences, setPreferences, resetPreferences } },
    children,
  )
}

export function usePreferences() {
  const context = useContext(PreferencesContext)

  if (!context) {
    throw new Error('usePreferences deve ser usado dentro de PreferencesProvider')
  }

  return context
}
