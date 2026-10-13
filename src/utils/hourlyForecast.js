import { getWeatherCondition } from './weatherCondition.js'

const DEFAULT_LIMIT = 8

function formatHourLabel(date) {
  const hour = Number(date.getHours())
  return `${hour}h`
}

export function getHourlyForecastOverview(hourly = {}, { limit = DEFAULT_LIMIT } = {}) {
  if (!hourly || !Array.isArray(hourly.time)) {
    return []
  }

  const timeList = hourly.time
  const startIndex = timeList.findIndex(time => new Date(time) >= new Date())
  const fromIndex = startIndex >= 0 ? startIndex : 0

  return timeList.slice(fromIndex, fromIndex + limit).map((time, index) => {
    const absoluteIndex = fromIndex + index
    const temperature = Number(hourly.temperature_2m?.[absoluteIndex] ?? 0)
    const chance = Number(hourly.precipitation_probability?.[absoluteIndex] ?? 0)
    const rain = Number(hourly.precipitation?.[absoluteIndex] ?? 0)
    const weatherCode = Number(hourly.weather_code?.[absoluteIndex] ?? 0)
    const date = new Date(time)

    return {
      time,
      label: index === 0 ? 'Agora' : formatHourLabel(date),
      temperature,
      chance,
      rain,
      weatherCode,
      condition: getWeatherCondition({
        weatherCode,
        temperature,
        isDay: 1,
      }),
    }
  })
}

export function getRainRiskLevel(items = []) {
  if (!items.length) {
    return 'sem chuva forte'
  }

  const maximumChance = items.reduce((highest, item) => {
    const chance = Number(item.chance ?? 0)
    return Math.max(highest, chance)
  }, 0)

  if (maximumChance >= 80) {
    return 'chuva intensa'
  }

  if (maximumChance >= 60) {
    return 'chuva moderada'
  }

  if (maximumChance >= 35) {
    return 'chuva leve'
  }

  return 'sem chuva forte'
}
