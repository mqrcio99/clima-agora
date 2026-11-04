import {
  DEFAULT_SETTINGS,
  getSettings,
  normalizeSettings,
  resetSettings,
  setSettings,
} from '../utils/storage.js'

export function createPreferencesRepository({
  read = getSettings,
  write = setSettings,
  reset = resetSettings,
} = {}) {
  return Object.freeze({
    read,
    save(nextSettings) {
      const normalized = normalizeSettings(nextSettings)
      write(normalized)
      return normalized
    },
    reset() {
      reset()
      return { ...DEFAULT_SETTINGS }
    },
  })
}

export const localPreferencesRepository = createPreferencesRepository()
