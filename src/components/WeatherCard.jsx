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

export function WeatherCard({ data, loading, error, condition }) {
  const current = data?.current
  const daily = data?.daily

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

      <div className="linha-temperatura" aria-live="polite">
        <div>
          <strong>{Math.round(current.temperature_2m)}°</strong>
          <span>{CONDITION_LABELS[condition] || 'Clima'}</span>
        </div>
        <p>
          Feels like <b>{Math.round(current.apparent_temperature)}°</b>
        </p>
      </div>

      <div className="grade-metricas">
        <div>
          <span>Umidade</span>
          <strong>{Math.round(current.relative_humidity_2m)}%</strong>
        </div>
        <div>
          <span>Vento</span>
          <strong>{Math.round(current.wind_speed_10m)} km/h</strong>
        </div>
        <div>
          <span>Minima</span>
          <strong>{Math.round(daily?.temperature_2m_min?.[0] ?? 0)}°</strong>
        </div>
        <div>
          <span>Máxima</span>
          <strong>{Math.round(daily?.temperature_2m_max?.[0] ?? 0)}°</strong>
        </div>
      </div>
    </section>
  )
}
