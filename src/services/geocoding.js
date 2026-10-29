import { fetchWithTimeout } from './http.js'

export async function searchCoordinates(city, { timeoutMs } = {}) {
  const params = new URLSearchParams({
    name: city,
    language: 'pt',
    count: '1',
  })

  const response = await fetchWithTimeout(
    `https://geocoding-api.open-meteo.com/v1/search?${params}`,
    { timeoutMs },
  )

  if (!response.ok) {
    throw new Error(`Não foi possível consultar a API (${response.status})`)
  }

  const result = await response.json()
  const place = result.results?.[0]

  if (!place) {
    throw new Error('Cidade não encontrada')
  }

  return {
    latitude: place.latitude,
    longitude: place.longitude,
    city: place.name,
  }
}

export async function getCityFromCoordinates(latitude, longitude, { timeoutMs } = {}) {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    localityLanguage: 'pt',
  })

  const response = await fetchWithTimeout(
    `https://api.bigdatacloud.net/data/reverse-geocode-client?${params}`,
    { timeoutMs },
  )

  if (!response.ok) {
    throw new Error(`Não foi possível consultar a API (${response.status})`)
  }

  const result = await response.json()
  return result.locality || result.city || result.country || 'Localidade desconhecida'
}
