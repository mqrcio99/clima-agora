import { Suspense, lazy, useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Header } from '../components/Header/Header.jsx'
import { WeatherBackground } from '../components/WeatherBackground'
import { useWeather } from '../hooks/useWeather.js'
import { getStoredCity, setStoredCity } from '../utils/storage.js'
import { getWeatherCondition } from '../utils/weatherCondition.js'
import { getWeatherSummary } from '../utils/weatherSummary.js'
import { usePreferences } from '../hooks/usePreferences.js'
import { AppHeader } from './AppHeader.jsx'
import { NAV_ITEMS } from './navItems.js'

const Playground = lazy(() => import('../playground/Playground.jsx'))

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

function getInitialDevice() {
  if (typeof window === 'undefined') {
    return 'normal'
  }

  const isLargeScreen = window.innerWidth >= 1920
  const userAgent = navigator.userAgent || ''
  const isTVDevice = /Tizen|webOS|PlayStation|Xbox|Nintendo|Android TV|SMART-TV|TV/i.test(userAgent)

  return isTVDevice || isLargeScreen ? 'tv' : 'normal'
}

export function AppLayout() {
  const location = useLocation()
  const [fallbackCity] = useState(() => getStoredCity())
  const [city, setCity] = useState('')
  const [cityInput, setCityInput] = useState(fallbackCity)
  const [cityInputEdited, setCityInputEdited] = useState(false)
  const [device, setDevice] = useState(getInitialDevice)
  const [debugCondition] = useState(getDebugCondition)
  const { data, loading, error, locationDenied } = useWeather({ city, fallbackCity })
  const { preferences } = usePreferences()
  const summary = getWeatherSummary(data)

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
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (!city && data?.city) {
      setStoredCity(data.city)
    }
  }, [city, data?.city])

  const weatherCondition =
    debugCondition && DEBUG_CONDITIONS.includes(debugCondition)
      ? debugCondition
      : data?.current
        ? getWeatherCondition({
            weatherCode: data.current.weather_code,
            temperature: data.current.temperature_2m,
            isDay: data.current.is_day,
          })
        : 'clear'
  const theme = preferences.theme === 'auto' ? weatherCondition : preferences.theme
  const displayedCity = city && loading ? city : data?.city || city || 'Local padrão'
  const displayedCityInput = cityInputEdited ? cityInput : city || data?.city || cityInput
  const showPlayground =
    import.meta.env.DEV && new URLSearchParams(window.location.search).has('playground')
  const handleSearch = nextCity => {
    const normalized = nextCity.trim()
    setCity(normalized)
    setCityInput(normalized)
    setCityInputEdited(true)
    setStoredCity(normalized)
  }

  return (
    <main className="app-clima" data-theme={theme} data-device={device}>
      <WeatherBackground condition={weatherCondition} />
      {showPlayground && (
        <Suspense fallback={<div className="playground-loader">Carregando playground…</div>}>
          <Playground />
        </Suspense>
      )}
      <div className="conteudo-clima">
        <AppHeader />
        {location.pathname === '/' && (
          <Header
            items={NAV_ITEMS}
            resumo={summary}
            loading={loading}
            error={Boolean(error)}
            city={displayedCity}
            locationDenied={locationDenied}
            cityInput={displayedCityInput}
            onCityChange={value => {
              setCityInput(value)
              setCityInputEdited(true)
            }}
            onSearch={handleSearch}
            showBrand={false}
          />
        )}
        <div className="route-content">
          <Suspense fallback={<p role="status">Carregando página…</p>}>
            <Outlet
              context={{
                data,
                loading,
                error,
                condition: weatherCondition,
                preferences,
              }}
            />
          </Suspense>
        </div>
      </div>
    </main>
  )
}