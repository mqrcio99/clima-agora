import { Suspense, lazy, useEffect, useState } from 'react'
import { CitySearch } from '../components/CitySearch'
import { Forecast } from '../components/Forecast'
import { LocationTransition } from '../components/LocationTransition'
import { WeatherBackground } from '../components/WeatherBackground'
import { WeatherCard } from '../components/WeatherCard'
import { useWeather } from '../hooks/useWeather'
import { getStoredCity, setStoredCity } from '../utils/storage'
import { getWeatherCondition } from '../utils/weatherCondition'
import '../styles/tokens.css'
import '../styles/themes.css'

const DEBUG_CONDITIONS = ['clear', 'rain', 'snow', 'cloudy', 'night', 'storm', 'cold']

function getDebugCondition() {
  const params = new URLSearchParams(window.location.search)
  return params.get('debug')
}

const Playground = lazy(() => import('../playground/Playground'))

export default function App() {
  const [city, setCity] = useState(() => getStoredCity())
  const [debugCondition] = useState(() => getDebugCondition())
  const [device, setDevice] = useState(() => {
    if (typeof window === 'undefined') {
      return 'normal'
    }

    const largeScreen = window.innerWidth >= 1920
    const userAgent = navigator.userAgent || ''
    const tvAgent = /Tizen|webOS|PlayStation|Xbox|Nintendo|Android TV|SMART-TV|TV/i.test(userAgent)

    return tvAgent || largeScreen ? 'tv' : 'normal'
  })
  const { data, loading, error } = useWeather({ city })

  const handleSearch = nextCity => {
    const normalized = nextCity.trim()
    setCity(normalized)
    setStoredCity(normalized)
  }

  useEffect(() => {
    const handleResize = () => {
      const largeScreen = window.innerWidth >= 1920
      const userAgent = navigator.userAgent || ''
      const tvAgent = /Tizen|webOS|PlayStation|Xbox|Nintendo|Android TV|SMART-TV|TV/i.test(
        userAgent,
      )
      setDevice(tvAgent || largeScreen ? 'tv' : 'normal')
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  const condition =
    debugCondition && DEBUG_CONDITIONS.includes(debugCondition)
      ? debugCondition
      : data?.current
        ? getWeatherCondition({
            weatherCode: data.current.weather_code,
            temperature: data.current.temperature_2m,
            isDay: data.current.is_day,
          })
        : 'clear'

  const showPlayground =
    import.meta.env.DEV && new URLSearchParams(window.location.search).get('playground') !== null

  return (
    <>
      {showPlayground && (
        <Suspense fallback={<div className="playground-loader">Carregando playground…</div>}>
          <Playground />
        </Suspense>
      )}
      <main className="app-clima" data-theme={condition} data-device={device}>
        <WeatherBackground condition={condition} />
        <div className="conteudo-clima">
          <header className="cabecalho">
            <div className="marca">
              <span className="marca__icone" aria-hidden="true">
                ☀
              </span>
              <span>Clima Agora</span>
            </div>
            <CitySearch
              value={city}
              onChange={setCity}
              onSearch={handleSearch}
              disabled={loading}
            />
          </header>

          <div className="grade-clima">
            {loading && !data ? (
              <LocationTransition />
            ) : (
              <WeatherCard data={data} loading={loading} error={error} condition={condition} />
            )}
            <Forecast data={data} />
          </div>

          {error && data && (
            <p className="error-note" role="alert">
              {error}
            </p>
          )}
        </div>
      </main>
    </>
  )
}
