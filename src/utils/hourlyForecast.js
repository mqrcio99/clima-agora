import { getWeatherCondition } from './weatherCondition.js'

const DEFAULT_LIMIT = 8

function formatLocalDateTime(date, timezone) {
  const parts = new Intl.DateTimeFormat('en', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date)
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]))

  return `${values.year}-${values.month}-${values.day}T${values.hour}:${values.minute}`
}

function formatHourLabel(time) {
  const hour = time.match(/T(\d{2}):\d{2}/)?.[1]
  return hour === undefined ? '—' : `${Number(hour)}h`
}

function safeNumber(value) {
  if (value === null || value === undefined || value === '') {
    return null
  }

  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

export function getHourlyForecastOverview(
  hourly = {},
  { limit = DEFAULT_LIMIT, now = new Date(), timezone } = {},
) {
  if (!hourly || !Array.isArray(hourly.time)) {
    return []
  }

  const timeList = hourly.time
  const selectedTimezone =
    timezone || hourly.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone
  const currentLocalTime = formatLocalDateTime(now, selectedTimezone)
  const startIndex = timeList.findIndex(time => time >= currentLocalTime)
  const fromIndex = startIndex >= 0 ? startIndex : 0

  return timeList.slice(fromIndex, fromIndex + limit).map((time, index) => {
    const absoluteIndex = fromIndex + index
    const temperature = safeNumber(hourly.temperature_2m?.[absoluteIndex])
    const chance = safeNumber(hourly.precipitation_probability?.[absoluteIndex])
    const rain = safeNumber(hourly.precipitation?.[absoluteIndex])
    const weatherCode = safeNumber(hourly.weather_code?.[absoluteIndex]) ?? 0

    return {
      time,
      label: index === 0 ? 'Agora' : formatHourLabel(time),
      temperature,
      chance,
      rain,
      weatherCode,
      condition: getWeatherCondition({
        weatherCode,
        temperature: temperature ?? Number.POSITIVE_INFINITY,
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
