const STORAGE_PREFIX = 'clima-agora'
const STORAGE_VERSION = 'v1'
const SETTINGS_VERSION = 1
const LEGACY_PREFERENCES_KEY = `${STORAGE_PREFIX}:${STORAGE_VERSION}:preferences`

const WEATHER_THEMES = [
  'clear',
  'rain',
  'snow',
  'cloudy',
  'night',
  'storm',
  'cold',
  'heat',
  'wind',
  'uv',
  'light',
  'dark',
]
const ANIMATION_MODES = ['system', 'on', 'off']
const TEMPERATURE_UNITS = ['celsius', 'fahrenheit']
const WIND_UNITS = ['kmh', 'ms', 'mph']
const TIME_FORMATS = ['24h', '12h']

export const STORAGE_KEYS = {
  lastCity: `${STORAGE_PREFIX}:${STORAGE_VERSION}:last-city`,
  favorites: `${STORAGE_PREFIX}:${STORAGE_VERSION}:favorites`,
  preferences: `${STORAGE_PREFIX}:${STORAGE_VERSION}:preferences`,
}

const LEGACY_LAST_CITY_KEY = `${STORAGE_PREFIX}:last-city`

export const SETTINGS_KEY = 'climaagora:v1:settings'

export const DEFAULT_SETTINGS = Object.freeze({
  theme: 'auto',
  animations: 'system',
  temperatureUnit: 'celsius',
  windUnit: 'kmh',
  timeFormat: '24h',
  useLocationOnOpen: true,
  defaultCity: '',
})

export const LAST_CITY_KEY = STORAGE_KEYS.lastCity

export const DEFAULT_PREFERENCES = Object.freeze({
  theme: 'auto',
  units: 'metric',
})

function getStorage() {
  try {
    if (typeof globalThis !== 'undefined' && globalThis.localStorage) {
      return globalThis.localStorage
    }

    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage
    }
  } catch {
    return null
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

  const candidateKeys = [STORAGE_KEYS.lastCity, LEGACY_LAST_CITY_KEY]

  for (const key of candidateKeys) {
    try {
      const rawValue = storage.getItem(key)

      if (rawValue === null) {
        continue
      }

      try {
        const parsedValue = JSON.parse(rawValue)
        const normalizedValue = typeof parsedValue === 'string' ? normalizeStoredString(parsedValue) : ''
        if (normalizedValue) {
          return normalizedValue
        }
      } catch {
        const normalizedValue = normalizeStoredString(rawValue)
        if (normalizedValue) {
          return normalizedValue
        }
      }
    } catch {
      continue
    }
  }

  return ''
}

export function setStoredCity(city) {
  const normalized = normalizeStoredString(city)

  if (!normalized) {
    safeRemoveValue(STORAGE_KEYS.lastCity)
    safeRemoveValue(LEGACY_LAST_CITY_KEY)
    return
  }

  safeWriteValue(STORAGE_KEYS.lastCity, normalized)
  safeRemoveValue(LEGACY_LAST_CITY_KEY)
}

export function normalizeSettings(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return { ...DEFAULT_SETTINGS }
  }

  const defaultCity =
    typeof value.defaultCity === 'string' &&
    value.defaultCity.trim().length <= 120 &&
    !Array.from(value.defaultCity).some(
      character => character.charCodeAt(0) <= 0x1f || character.charCodeAt(0) === 0x7f,
    )
      ? value.defaultCity.trim()
      : DEFAULT_SETTINGS.defaultCity

  return {
    theme:
      value.theme === 'auto' || WEATHER_THEMES.includes(value.theme)
        ? value.theme
        : DEFAULT_SETTINGS.theme,
    animations: ANIMATION_MODES.includes(value.animations)
      ? value.animations
      : DEFAULT_SETTINGS.animations,
    temperatureUnit: TEMPERATURE_UNITS.includes(value.temperatureUnit)
      ? value.temperatureUnit
      : DEFAULT_SETTINGS.temperatureUnit,
    windUnit: WIND_UNITS.includes(value.windUnit) ? value.windUnit : DEFAULT_SETTINGS.windUnit,
    timeFormat: TIME_FORMATS.includes(value.timeFormat) ? value.timeFormat : DEFAULT_SETTINGS.timeFormat,
    useLocationOnOpen:
      typeof value.useLocationOnOpen === 'boolean'
        ? value.useLocationOnOpen
        : DEFAULT_SETTINGS.useLocationOnOpen,
    defaultCity,
  }
}

function migrateLegacyPreferences() {
  const legacy = safeReadValue(LEGACY_PREFERENCES_KEY, null)

  if (!legacy || typeof legacy !== 'object' || Array.isArray(legacy)) {
    return { ...DEFAULT_SETTINGS }
  }

  const migrated = normalizeSettings({
    theme: legacy.theme,
    temperatureUnit: legacy.units === 'imperial' ? 'fahrenheit' : 'celsius',
    windUnit: legacy.units === 'imperial' ? 'mph' : 'kmh',
  })

  safeWriteValue(SETTINGS_KEY, { version: SETTINGS_VERSION, values: migrated })
  return migrated
}

export function getSettings() {
  const stored = safeReadValue(SETTINGS_KEY, null)

  if (stored && typeof stored === 'object' && !Array.isArray(stored)) {
    if (stored.version === SETTINGS_VERSION) {
      return normalizeSettings(stored.values)
    }

    if (stored.version === 0 && stored.values && typeof stored.values === 'object') {
      const migrated = normalizeSettings(stored.values)
      safeWriteValue(SETTINGS_KEY, { version: SETTINGS_VERSION, values: migrated })
      return migrated
    }
  }

  return migrateLegacyPreferences()
}

export function setSettings(nextSettings) {
  if (!nextSettings || typeof nextSettings !== 'object' || Array.isArray(nextSettings)) {
    return false
  }

  const normalized = normalizeSettings({ ...getSettings(), ...nextSettings })
  return safeWriteValue(SETTINGS_KEY, { version: SETTINGS_VERSION, values: normalized })
}

export function resetSettings() {
  return safeWriteValue(SETTINGS_KEY, {
    version: SETTINGS_VERSION,
    values: { ...DEFAULT_SETTINGS },
  })
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
