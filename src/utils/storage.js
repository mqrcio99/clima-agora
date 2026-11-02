const STORAGE_PREFIX = 'clima-agora'
const STORAGE_VERSION = 'v1'

export const STORAGE_KEYS = {
  lastCity: `${STORAGE_PREFIX}:${STORAGE_VERSION}:last-city`,
  favorites: `${STORAGE_PREFIX}:${STORAGE_VERSION}:favorites`,
  preferences: `${STORAGE_PREFIX}:${STORAGE_VERSION}:preferences`,
}

export const LAST_CITY_KEY = STORAGE_KEYS.lastCity

export const DEFAULT_PREFERENCES = Object.freeze({
  theme: 'auto',
  units: 'metric',
})

function getStorage() {
  if (typeof globalThis !== 'undefined' && globalThis.localStorage) {
    return globalThis.localStorage
  }

  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage
  }

  return null
}

function safeReadValue(key, fallback) {
  const storage = getStorage()

  if (!storage) {
    return fallback
  }

  try {
    const rawValue = storage.getItem(key)

    if (rawValue === null) {
      return fallback
    }

    return JSON.parse(rawValue)
  } catch {
    return fallback
  }
}

function safeWriteValue(key, value) {
  const storage = getStorage()

  if (!storage) {
    return false
  }

  try {
    storage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

function safeRemoveValue(key) {
  const storage = getStorage()

  if (!storage) {
    return false
  }

  try {
    storage.removeItem(key)
    return true
  } catch {
    return false
  }
}

function normalizeStoredString(value) {
  if (typeof value !== 'string') {
    return ''
  }

  return value.trim()
}

export function getStoredCity() {
  const storage = getStorage()

  if (!storage) {
    return ''
  }

  try {
    const rawValue = storage.getItem(STORAGE_KEYS.lastCity)

    if (rawValue === null) {
      return ''
    }

    try {
      const parsedValue = JSON.parse(rawValue)
      return typeof parsedValue === 'string' ? normalizeStoredString(parsedValue) : ''
    } catch {
      return normalizeStoredString(rawValue)
    }
  } catch {
    return ''
  }
}

export function setStoredCity(city) {
  const normalized = normalizeStoredString(city)

  if (!normalized) {
    safeRemoveValue(STORAGE_KEYS.lastCity)
    return
  }

  safeWriteValue(STORAGE_KEYS.lastCity, normalized)
}

function normalizeFavorite(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null
  }

  const city = normalizeStoredString(value.city)
  const latitude = Number(value.latitude)
  const longitude = Number(value.longitude)

  if (!city || Number.isNaN(latitude) || Number.isNaN(longitude)) {
    return null
  }

  return {
    city,
    latitude,
    longitude,
  }
}

export function getFavorites() {
  const data = safeReadValue(STORAGE_KEYS.favorites, [])

  if (!Array.isArray(data)) {
    return []
  }

  return data.map(normalizeFavorite).filter(Boolean).slice(0, 100)
}

export function setFavorites(items) {
  if (!Array.isArray(items)) {
    return
  }

  const normalized = items
    .map(normalizeFavorite)
    .filter(Boolean)
    .slice(0, 100)

  safeWriteValue(STORAGE_KEYS.favorites, normalized)
}

export function getPreferences() {
  const data = safeReadValue(STORAGE_KEYS.preferences, DEFAULT_PREFERENCES)

  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return { ...DEFAULT_PREFERENCES }
  }

  return {
    ...DEFAULT_PREFERENCES,
    ...data,
    theme: ['auto', 'light', 'dark'].includes(data.theme) ? data.theme : DEFAULT_PREFERENCES.theme,
    units: ['metric', 'imperial'].includes(data.units) ? data.units : DEFAULT_PREFERENCES.units,
  }
}

export function setPreferences(nextPreferences) {
  if (!nextPreferences || typeof nextPreferences !== 'object' || Array.isArray(nextPreferences)) {
    return
  }

  const currentPreferences = getPreferences()
  const mergedPreferences = {
    ...currentPreferences,
    ...nextPreferences,
  }

  safeWriteValue(STORAGE_KEYS.preferences, {
    theme: ['auto', 'light', 'dark'].includes(mergedPreferences.theme)
      ? mergedPreferences.theme
      : DEFAULT_PREFERENCES.theme,
    units: ['metric', 'imperial'].includes(mergedPreferences.units)
      ? mergedPreferences.units
      : DEFAULT_PREFERENCES.units,
  })
}
