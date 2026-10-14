import { getWeatherAlerts } from '../../utils/alerts.js'

const ICONS = {
  clear: '☀️',
  night: '🌙',
  cloudy: '☁️',
  rain: '🌧️',
  snow: '❄️',
  cold: '❄️',
  storm: '⛈️',
}

const CONDITION_LABELS = {
  clear: 'Sol forte',
  night: 'Noite clara',
  cloudy: 'Nublado',
  rain: 'Chuva',
  snow: 'Neve',
  cold: 'Frio',
  storm: 'Tempestade',
}

function safeNumber(value, fallback = 0) {
  const number = Number(value)
  return Number.isFinite(number) ? number : fallback
}

function formatTime(value) {
  if (!value) {
    return '—'
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return '—'
  }

  return new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function WeatherCard({ data, loading, error, condition }) {
  const current = data?.current
  const daily = data?.daily
  const alerts = getWeatherAlerts(data ?? {})

  if (loading) {
    return (
      <section className="cartao-clima cartao-clima--loading" aria-label="Carregando previsão">
        <div className="skeleton skeleton--title" />
        <div className="skeleton skeleton--temperature" />
        <div className="skeleton skeleton--metrics" />
      </section>
    )
  }

  if (error && !data) {
    return (
      <section className="cartao-clima cartao-clima--error" role="alert">
        <span className="cartao-clima__icon">⚠️</span>
        <h2>Não foi possível carregar o clima</h2>
        <p>{error}</p>
      </section>
    )
  }

  if (!data || !current) {
    return null
  }

  const selectedAlert = alerts[0]

  return (
    <section className="cartao-clima" aria-label={`Previsão do tempo para ${data.city}`}>
      <div className="cartao-clima__cabecalho">
        <div>
          <p className="eyebrow">Previsão do tempo</p>
          <h1>{data.city}</h1>
        </div>
        <span className="icone-condicao" aria-hidden="true">
          {ICONS[condition] || '☁️'}
        </span>
      </div>

      {selectedAlert && (
        <div className="alert-banner" role="status" aria-live="polite">
          <span className="alert-banner__icon" aria-hidden="true">
            {selectedAlert.icon}
          </span>
          <div>
            <strong>{selectedAlert.title}</strong>
            <small>{selectedAlert.description}</small>
          </div>
        </div>
      )}

      <div className="linha-temperatura" aria-live="polite">
        <div>
          <strong>{Math.round(safeNumber(current.temperature_2m))}°</strong>
          <span>{CONDITION_LABELS[condition] || 'Clima'}</span>
        </div>
        <p>
          Sensação <b>{Math.round(safeNumber(current.apparent_temperature))}°</b>
        </p>
      </div>

      <div className="grade-metricas">
        <div>
          <span>Umidade</span>
          <strong>{Math.round(safeNumber(current.relative_humidity_2m))}%</strong>
        </div>
        <div>
          <span>Vento</span>
          <strong>{Math.round(safeNumber(current.wind_speed_10m))} km/h</strong>
        </div>
        <div>
          <span>Minima</span>
          <strong>{Math.round(safeNumber(daily?.temperature_2m_min?.[0]))}°</strong>
        </div>
        <div>
          <span>Máxima</span>
          <strong>{Math.round(safeNumber(daily?.temperature_2m_max?.[0]))}°</strong>
        </div>
        <div>
          <span>Nascer</span>
          <strong>{formatTime(daily?.sunrise?.[0])}</strong>
        </div>
        <div>
          <span>Pôr do sol</span>
          <strong>{formatTime(daily?.sunset?.[0])}</strong>
        </div>
        <div>
          <span>UV</span>
          <strong>{Math.round(safeNumber(current.uv_index ?? daily?.uv_index_max?.[0]))}</strong>
        </div>
        <div>
          <span>Chuva</span>
          <strong>{Math.round(safeNumber(daily?.precipitation_probability_max?.[0]))}%</strong>
        </div>
      </div>

      {selectedAlert && (
        <p className="alert-banner__note">
          Avisos calculados localmente e não substituem alertas oficiais.
        </p>
      )}
    </section>
  )
}
