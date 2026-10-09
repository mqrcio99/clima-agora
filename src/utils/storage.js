export const LAST_CITY_KEY = 'clima-agora:last-city'

function getStorage() {
  if (typeof globalThis !== 'undefined' && globalThis.localStorage) {
    return globalThis.localStorage
  }

  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage
  }

  return null
}

export function getStoredCity() {
  const storage = getStorage()

  if (!storage) {
    return ''
  }

  try {
    return storage.getItem(LAST_CITY_KEY) ?? ''
  } catch {
    return ''
  }
}

export function setStoredCity(city) {
  const storage = getStorage()

  if (!storage) {
    return
  }

  const normalized = (city ?? '').trim()

  try {
    if (!normalized) {
      storage.removeItem(LAST_CITY_KEY)
      return
    }

    storage.setItem(LAST_CITY_KEY, normalized)
  } catch {
    // storage indisponível: a aplicação continua funcionando com busca manual
  }
}
