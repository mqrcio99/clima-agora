import { getWeatherCondition } from './weatherCondition.js'

const CONDITION_ICONS = {
  clear: '☀️',
  night: '🌙',
  cloudy: '☁️',
  rain: '🌧️',
  snow: '❄️',
  cold: '❄️',
  storm: '⛈️',
}

function getNumber(value) {
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

function getDailyIcon(weatherCode, temperature) {
  if (getNumber(weatherCode) === null) {
    return null
  }

  const condition = getWeatherCondition({
    weatherCode,
    temperature: getNumber(temperature) ?? undefined,
    isDay: 1,
  })

  return CONDITION_ICONS[condition] ?? null
}

export function getWeatherSummary(data, { rainProbabilityThreshold = 50 } = {}) {
  const current = data?.current
  const daily = data?.daily
  const minTemperatures = daily?.temperature_2m_min ?? []
  const maxTemperatures = daily?.temperature_2m_max ?? []
  const rainProbabilities = daily?.precipitation_probability_max ?? []
  const forecastMinima = minTemperatures
    .slice(0, 16)
    .map(getNumber)
    .filter(value => value !== null)
  const forecastMaxima = maxTemperatures
    .slice(0, 16)
    .map(getNumber)
    .filter(value => value !== null)

  return {
    agora: {
      icone: getDailyIcon(current?.weather_code, current?.temperature_2m),
      temperatura: getNumber(current?.temperature_2m),
    },
    hoje: {
      min: getNumber(minTemperatures[0]),
      max: getNumber(maxTemperatures[0]),
      chuvaProb: getNumber(rainProbabilities[0]),
    },
    amanha: {
      icone: getDailyIcon(daily?.weather_code?.[1], maxTemperatures[1]),
      min: getNumber(minTemperatures[1]),
      max: getNumber(maxTemperatures[1]),
    },
    quinzeDias: {
      min: forecastMinima.length ? Math.min(...forecastMinima) : null,
      max: forecastMaxima.length ? Math.max(...forecastMaxima) : null,
      diasComChuva: rainProbabilities.slice(0, 16).filter(probability => {
        const value = getNumber(probability)
        return value !== null && value > rainProbabilityThreshold
      }).length,
    },
  }
}
