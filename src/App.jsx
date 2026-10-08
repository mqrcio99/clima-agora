import { useEffect, useMemo, useState } from 'react'
import { CitySearch } from './components/CitySearch'
import { Forecast } from './components/Forecast'
import { LocationTransition } from './components/LocationTransition'
import { WeatherBackground } from './components/WeatherBackground'
import { WeatherCard } from './components/WeatherCard'
import { useWeather } from './hooks/useWeather'
import { getWeatherCondition } from './utils/weatherCondition'
import './styles/themes.css'

const DEBUG_CONDITIONS = ['clear', 'rain', 'snow', 'cloudy', 'night', 'storm', 'cold']

function getDebugCondition() {
  const params = new URLSearchParams(window.location.search)
  return params.get('debug')
}

export default function App() {
  const [city, setCity] = useState('')
  const [debugCondition, setDebugCondition] = useState(getDebugCondition())
  const { data, loading, error } = useWeather({ city })

  const condition = useMemo(() => {
    if (debugCondition && DEBUG_CONDITIONS.includes(debugCondition)) {
      return debugCondition
    }

    if (!data?.current) return 'clear'

    return getWeatherCondition({
      weatherCode: data.current.weather_code,
      temperature: data.current.temperature_2m,
      isDay: data.current.is_day,
    })
  }, [data, debugCondition])

  useEffect(() => {
    setDebugCondition(getDebugCondition())
  }, [])

  return (
    <main className="app-shell" data-theme={condition}>
      <WeatherBackground condition={condition} />
      <div className="app-content">
        <header className="topbar">
          <div className="brand">
            <span className="brand__mark" aria-hidden="true">☀</span>
            <span>Clima Agora</span>
          </div>
          <CitySearch onSearch={setCity} disabled={loading} />
        </header>

        <div className="weather-grid">
          {loading && !data ? (
            <LocationTransition />
          ) : (
            <WeatherCard data={data} loading={loading} error={error} condition={condition} />
          )}
          <Forecast data={data} />
        </div>

        {error && data && (
          <p className="error-note" role="alert">{error}</p>
        )}
      </div>
    </main>
  )
}
