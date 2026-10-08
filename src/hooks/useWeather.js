import { useCallback, useEffect, useState } from 'react'
import { getWeatherCondition } from '../utils/weatherCondition.js'

const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast'
const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search'
const REVERSE_GEOCODING_URL = 'https://api.bigdatacloud.net/data/reverse-geocode-client'
const REFRESH_INTERVAL = 10 * 60 * 1000

async function fetchJson(url) {
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Não foi possível consultar a API (${response.status})`)
  }

  return response.json()
}

async function getCityFromCoordinates(latitude, longitude) {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    localityLanguage: 'pt',
  })

  const result = await fetchJson(`${REVERSE_GEOCODING_URL}?${params}`)
  return result.locality || result.city || result.country || 'Localidade desconhecida'
}

async function searchCoordinates(city) {
  const params = new URLSearchParams({
    name: city,
    language: 'pt',
    count: '1',
  })

  const result = await fetchJson(`${GEOCODING_URL}?${params}`)
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

async function fetchWeather(latitude, longitude) {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    current: 'temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code,is_day',
    daily: 'temperature_2m_max,temperature_2m_min,weather_code',
    timezone: 'auto',
  })

  return fetchJson(`${FORECAST_URL}?${params}`)
}

export function useWeather({ city: requestedCity = '' } = {}) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [condition, setCondition] = useState(null)

  const loadWeather = useCallback(async (latitude, longitude, cityName) => {
    try {
      const forecast = await fetchWeather(latitude, longitude)
      const resolvedCity = cityName || await getCityFromCoordinates(latitude, longitude)
      setData({
        ...forecast,
        city: resolvedCity,
        latitude,
        longitude,
      })
      setCondition(
        getWeatherCondition({
          weatherCode: forecast.current?.weather_code,
          temperature: forecast.current?.temperature_2m,
          isDay: forecast.current?.is_day,
        }),
      )
      setError('')
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Não foi possível carregar o clima')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    let timer

    const start = async () => {
      setLoading(true)
      setError('')

      try {
        if (requestedCity.trim()) {
          const place = await searchCoordinates(requestedCity.trim())
          if (!cancelled) {
            await loadWeather(place.latitude, place.longitude, place.city)
          }
          return
        }

        if (!navigator.geolocation) {
          throw new Error('A geolocalização não é disponível neste navegador')
        }

        navigator.geolocation.getCurrentPosition(
          (position) => {
            if (!cancelled) {
              loadWeather(
                position.coords.latitude,
                position.coords.longitude,
              )
            }
          },
          (permissionError) => {
            if (!cancelled) {
              setLoading(false)
              setError(
                permissionError.code === permissionError.PERMISSION_DENIED
                  ? 'Permissão de localização negada. Pesquise uma cidade para continuar.'
                  : 'Não foi possível localizar o dispositivo. Pesquise uma cidade.'
              )
            }
          },
          { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
        )
      } catch (requestError) {
        if (!cancelled) {
          setLoading(false)
          setError(requestError instanceof Error ? requestError.message : 'Não foi possível iniciar a busca')
        }
      }
    }

    start()
    timer = window.setInterval(() => {
      if (requestedCity.trim()) {
        return
      }
      navigator.geolocation?.getCurrentPosition(
        (position) => loadWeather(position.coords.latitude, position.coords.longitude),
        () => setError('Não foi possível atualizar a localização'),
      )
    }, REFRESH_INTERVAL)

    return () => {
      cancelled = true
      window.clearInterval(timer)
    }
  }, [requestedCity, loadWeather])

  return { data, loading, error, condition }
}
