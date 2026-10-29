import { useCallback, useEffect, useRef, useState } from 'react'
import { getCityFromCoordinates, searchCoordinates } from '../services/geocoding.js'
import { fetchWeather } from '../services/weather.js'
import { getWeatherCondition } from '../utils/weatherCondition.js'

const REFRESH_INTERVAL = 10 * 60 * 1000

export function useWeather({ city: requestedCity = '' } = {}) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [condition, setCondition] = useState(null)
  const requestId = useRef(0)

  const loadWeather = useCallback(async (latitude, longitude, cityName, isCurrent) => {
    try {
      const forecast = await fetchWeather(latitude, longitude)
      if (!isCurrent()) return

      const resolvedCity = cityName || (await getCityFromCoordinates(latitude, longitude))
      if (!isCurrent()) return

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
      if (isCurrent()) {
        setError(
          requestError instanceof Error
            ? requestError.message
            : 'Não foi possível carregar o clima',
        )
      }
    } finally {
      if (isCurrent()) {
        setLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    let timer
    const activeRequestId = ++requestId.current
    const isCurrent = () => !cancelled && requestId.current === activeRequestId

    const start = async () => {
      setLoading(true)
      setError('')

      try {
        if (requestedCity.trim()) {
          const place = await searchCoordinates(requestedCity.trim())
          if (isCurrent()) {
            await loadWeather(place.latitude, place.longitude, place.city, isCurrent)
          }
          return
        }

        if (typeof navigator === 'undefined' || !('geolocation' in navigator)) {
          throw new Error(
            'A geolocalização não é compatível com este navegador. Pesquise uma cidade para continuar.',
          )
        }

        try {
          navigator.geolocation.getCurrentPosition(
            position => {
              if (isCurrent()) {
                loadWeather(position.coords.latitude, position.coords.longitude, undefined, isCurrent)
              }
            },
            permissionError => {
              if (isCurrent()) {
                setLoading(false)
                setError(
                  permissionError.code === permissionError.PERMISSION_DENIED
                    ? 'Permissão de localização negada. Pesquise uma cidade para continuar.'
                    : 'Não foi possível localizar o dispositivo. Pesquise uma cidade.',
                )
              }
            },
            { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
          )
        } catch {
          throw new Error(
            'A geolocalização não pôde ser iniciada neste navegador. Pesquise uma cidade para continuar.',
          )
        }
      } catch (requestError) {
        if (isCurrent()) {
          setLoading(false)
          setError(
            requestError instanceof Error
              ? requestError.message
              : 'Não foi possível iniciar a busca',
          )
        }
      }
    }

    start()
    timer = window.setInterval(() => {
      if (requestedCity.trim()) {
        return
      }
      navigator.geolocation?.getCurrentPosition(
        position =>
          loadWeather(position.coords.latitude, position.coords.longitude, undefined, isCurrent),
        () => {
          if (isCurrent()) {
            setError('Não foi possível atualizar a localização')
          }
        },
      )
    }, REFRESH_INTERVAL)

    return () => {
      cancelled = true
      window.clearInterval(timer)
    }
  }, [requestedCity, loadWeather])

  return { data, loading, error, condition }
}
