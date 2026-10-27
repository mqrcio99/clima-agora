import { Suspense, lazy, useEffect, useState } from 'react'
import { Header } from '../components/Header/Header.jsx'
import { Forecast } from '../components/Forecast'
import { LocationTransition } from '../components/LocationTransition'
import { WeatherBackground } from '../components/WeatherBackground'
import { WeatherCard } from '../components/WeatherCard'
import { NAV_ITEMS } from './navItems.js'
import { useWeather } from '../hooks/useWeather'
import { getStoredCity, setStoredCity } from '../utils/storage'
import { getWeatherCondition } from '../utils/weatherCondition'
import { getWeatherSummary } from '../utils/weatherSummary.js'
import '../styles/tokens.css'
import '../styles/themes.css'

const DEBUG_CONDITIONS = [
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
]

function getDebugCondition() {
  const params = new URLSearchParams(window.location.search)
  return params.get('debug')
}

const Playground = lazy(() => import('../playground/Playground'))

export default function App() {
  const [city, setCity] = useState(() => getStoredCity())
  const [cityInput, setCityInput] = useState(city)
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
  const { data, loading, error, locationDenied } = useWeather({ city })
  const resumo = getWeatherSummary(data)
  const displayedCity = city && loading ? city : data?.city || city || 'Local padrão'

  const handleSearch = nextCity => {
    const normalized = nextCity.trim()
    setCity(normalized)
    setCityInput(normalized)
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
          <Header
            items={NAV_ITEMS}
            resumo={resumo}
            loading={loading}
            error={Boolean(error)}
            city={displayedCity}
            locationDenied={locationDenied}
            cityInput={cityInput}
            onCityChange={setCityInput}
            onSearch={handleSearch}
          />

          <div className="grade-clima">
            <div id="agora" className="ancora-clima">
              {loading && !data ? (
                <LocationTransition />
              ) : (
                <WeatherCard data={data} loading={loading} error={error} condition={condition} />
              )}
            </div>
            <Forecast data={data} />
          </div>

          <div className="secoes-previsao">
            <Forecast data={data} id="hoje" title="Hoje" daysToShow={1} showHourly={false} />
            <Forecast
              data={data}
              id="amanha"
              title="Amanhã"
              startIndex={1}
              daysToShow={1}
              showHourly={false}
            />
            <Forecast
              data={data}
              id="quinze-dias"
              title="15 dias"
              daysToShow={16}
              showHourly={false}
            />
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
