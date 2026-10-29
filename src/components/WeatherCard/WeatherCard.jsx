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

function safeNumber(value) {
  if (value === null || value === undefined || value === '') {
    return null
  }

  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

function formatMetric(value, unit = '') {
  const number = safeNumber(value)
  return number === null ? '—' : `${Math.round(number)}${unit}`
}

function formatTime(value, timezone) {
  if (!value) {
    return '—'
  }

  const localTime = value.match(/T(\d{2}:\d{2})/)
  if (localTime) {
    return localTime[1]
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return '—'
  }

  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: timezone,
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function WeatherCard({ data, loading, error, condition }) {
  const current = data?.current
  const daily = data?.daily
  const alerts = getWeatherAlerts(data ?? {})
  const orderedAlerts = [...alerts].sort(
    (first, second) =>
      (first.severity === 'alerta' ? 0 : 1) - (second.severity === 'alerta' ? 0 : 1),
  )
  const hasImportantAlert = orderedAlerts.some(alert => alert.severity === 'alerta')

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

      {orderedAlerts.length > 0 && (
        <div
          className="alert-banner"
          role={hasImportantAlert ? 'alert' : 'status'}
          aria-live={hasImportantAlert ? 'assertive' : 'polite'}
        >
          <ul className="alert-banner__list">
            {orderedAlerts.map(alert => (
              <li key={alert.key}>
                <span className="alert-banner__icon" aria-hidden="true">
                  {alert.icon}
                </span>
                <div>
                  <strong>{alert.title}</strong>
                  <small>{alert.description}</small>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="linha-temperatura" aria-live="polite">
        <div>
          <strong>{formatMetric(current.temperature_2m, '°')}</strong>
          <span>{CONDITION_LABELS[condition] || 'Clima'}</span>
        </div>
        <p>
          Sensação <b>{formatMetric(current.apparent_temperature, '°')}</b>
        </p>
      </div>

      <div className="grade-metricas">
        <div>
          <span>Umidade</span>
          <strong>{formatMetric(current.relative_humidity_2m, '%')}</strong>
        </div>
        <div>
          <span>Vento</span>
          <strong>
            {safeNumber(current.wind_speed_10m) === null
              ? '—'
              : `${Math.round(safeNumber(current.wind_speed_10m))} km/h`}
          </strong>
        </div>
        <div>
          <span>Mínima</span>
          <strong>{formatMetric(daily?.temperature_2m_min?.[0], '°')}</strong>
        </div>
        <div>
          <span>Máxima</span>
          <strong>{formatMetric(daily?.temperature_2m_max?.[0], '°')}</strong>
        </div>
        <div>
          <span>Nascer</span>
          <strong>{formatTime(daily?.sunrise?.[0], data.timezone)}</strong>
        </div>
        <div>
          <span>Pôr do sol</span>
          <strong>{formatTime(daily?.sunset?.[0], data.timezone)}</strong>
        </div>
        <div>
          <span>UV</span>
          <strong>{formatMetric(current.uv_index ?? daily?.uv_index_max?.[0])}</strong>
        </div>
        <div>
          <span>Chuva</span>
          <strong>{formatMetric(daily?.precipitation_probability_max?.[0], '%')}</strong>
        </div>
      </div>

      {orderedAlerts.length > 0 && (
        <p className="alert-banner__note">
          Avisos calculados localmente e não substituem alertas oficiais.
        </p>
      )}
    </section>
  )
}
