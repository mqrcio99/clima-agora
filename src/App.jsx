import { useEffect, useState } from 'react'
import { CitySearch } from './components/CitySearch'
import { Forecast } from './components/Forecast/Forecast.jsx'
import { LocationTransition } from './components/LocationTransition'
import { WeatherBackground } from './components/WeatherBackground'
import { WeatherCard } from './components/WeatherCard/WeatherCard.jsx'
import { useAuth } from './hooks/useAuth'
import { useWeather } from './hooks/useWeather'
import { isSupabaseConfigured, signInWithSocial } from './services/supabase'
import { getStoredCity, setStoredCity } from './utils/storage'
import { getWeatherCondition } from './utils/weatherCondition'
import './styles/tokens.css'
import './styles/themes.css'

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

export default function App() {
  const [city, setCity] = useState(() => getStoredCity())
  const [cityInput, setCityInput] = useState(city)
  const [debugCondition] = useState(() => getDebugCondition())
  const [device, setDevice] = useState(() => {
    if (typeof window === 'undefined') {
      return 'normal'
    }

    const isLargeScreen = window.innerWidth >= 1920
    const userAgent = navigator.userAgent || ''
    const isTVDevice = /Tizen|webOS|PlayStation|Xbox|Nintendo|Android TV|SMART-TV|TV/i.test(
      userAgent,
    )

    return isTVDevice || isLargeScreen ? 'tv' : 'normal'
  })
  const { data, loading, error } = useWeather({ city })
  const { session, loading: authLoading, error: authError, signOut } = useAuth()

  const handleSearch = nextCity => {
    const normalized = nextCity.trim()
    setCity(normalized)
    setCityInput(normalized)
    setStoredCity(normalized)
  }

  const handleSocialLogin = async () => {
    const response = await signInWithSocial('google')

    if (response?.error) {
      console.error(response.error)
    }
  }

  const handleLogout = async () => {
    await signOut()
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

  return (
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
            value={cityInput}
            onChange={setCityInput}
            onSearch={handleSearch}
            disabled={loading}
          />
          {isSupabaseConfigured() && (
            <div className="auth-actions">
              {session?.user ? (
                <>
                  <span className="auth-user">{session.user.email || 'Usuário autenticado'}</span>
                  <button type="button" onClick={handleLogout} disabled={authLoading}>
                    Sair
                  </button>
                </>
              ) : (
                <button type="button" onClick={handleSocialLogin} disabled={authLoading}>
                  Entrar com Google
                </button>
              )}
              {authError && <span className="auth-error">{authError}</span>}
            </div>
          )}
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
  )
}
