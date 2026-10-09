import { getWeatherCondition } from '../../utils/weatherCondition.js'

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

export function Forecast({ data }) {
  const days = data?.daily
  if (!days) return null

  return (
    <section className="previsao" aria-label="Previsão dos próximos cinco dias">
      <div className="previsao__cabecalho">
        <h2>Próximos 5 dias</h2>
        <span>Previsão diária</span>
      </div>
      <div className="previsao__lista">
        {days.time.slice(0, 5).map((date, index) => {
          const day = new Date(`${date}T12:00:00`)
          const formatter =
            typeof Intl !== 'undefined' && typeof Intl.DateTimeFormat === 'function'
              ? new Intl.DateTimeFormat('pt-BR', { weekday: 'short' })
              : null
          const label =
            index === 0
              ? 'Hoje'
              : formatter
                ? formatter.format(day)
                : day.toDateString().slice(0, 3)
          const condition = getWeatherCondition({
            weatherCode: days.weather_code[index],
            temperature: days.temperature_2m_max[index],
            isDay: 1,
          })

          return (
            <article className="cartao-dia" key={date}>
              <span>{label}</span>
              <strong>{ICONS[condition]}</strong>
              <small className="cartao-dia__label">{CONDITION_LABELS[condition]}</small>
              <div>
                <b>{Math.round(days.temperature_2m_max[index])}°</b>
                <small>{Math.round(days.temperature_2m_min[index])}°</small>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
