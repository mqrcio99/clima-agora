import { fetchWithTimeout } from './http.js'

const WEATHER_CACHE = new Map()
const WEATHER_REQUESTS = new Map()
const CACHE_TTL_MS = 5 * 60 * 1000

function getCacheKey(latitude, longitude) {
  return `${Number(latitude).toFixed(4)},${Number(longitude).toFixed(4)}`
}

export async function fetchWeather(latitude, longitude, { timeoutMs } = {}) {
  const cacheKey = getCacheKey(latitude, longitude)
  const cachedEntry = WEATHER_CACHE.get(cacheKey)

  if (cachedEntry && Date.now() - cachedEntry.timestamp < CACHE_TTL_MS) {
    return cachedEntry.data
  }

  const pendingRequest = WEATHER_REQUESTS.get(cacheKey)
  if (pendingRequest) {
    return pendingRequest
  }

  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    current:
      'temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,wind_gusts_10m,weather_code,is_day,uv_index',
    hourly: 'temperature_2m,precipitation_probability,precipitation,weather_code',
    daily:
      'temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum,uv_index_max,sunrise,sunset,weather_code',
    minutely_15: 'precipitation',
    forecast_days: '16',
    timezone: 'auto',
  })

  const request = (async () => {
    const response = await fetchWithTimeout(`https://api.open-meteo.com/v1/forecast?${params}`, {
      timeoutMs,
    })

    if (!response.ok) {
      throw new Error(`Não foi possível consultar a API (${response.status})`)
    }

    const payload = await response.json()
    WEATHER_CACHE.set(cacheKey, { timestamp: Date.now(), data: payload })
    return payload
  })()

  WEATHER_REQUESTS.set(cacheKey, request)

  try {
    return await request
  } finally {
    if (WEATHER_REQUESTS.get(cacheKey) === request) {
      WEATHER_REQUESTS.delete(cacheKey)
    }
  }
}
