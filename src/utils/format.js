const WIND_FACTORS = Object.freeze({
  kmh: 1,
  ms: 1 / 3.6,
  mph: 0.62137119223733,
})

function finiteNumber(value) {
  if (value === null || value === undefined || value === '') {
    return null
  }

  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

export function convertTemperature(value, unit = 'celsius') {
  const number = finiteNumber(value)

  if (number === null) {
    return null
  }

  return unit === 'fahrenheit' ? (number * 9) / 5 + 32 : number
}

export function formatTemperature(value, unit = 'celsius') {
  const converted = convertTemperature(value, unit)

  if (converted === null) {
    return '—'
  }

  return `${Math.round(converted)}°${unit === 'fahrenheit' ? 'F' : 'C'}`
}

export function convertWindSpeed(value, unit = 'kmh') {
  const number = finiteNumber(value)

  if (number === null) {
    return null
  }

  const factor = WIND_FACTORS[unit] ?? WIND_FACTORS.kmh
  const converted = number * factor
  return unit === 'mph' ? Math.round(converted * 10_000) / 10_000 : converted
}

export function formatWindSpeed(value, unit = 'kmh') {
  const converted = convertWindSpeed(value, unit)

  if (converted === null) {
    return '—'
  }

  const normalizedUnit = Object.hasOwn(WIND_FACTORS, unit) ? unit : 'kmh'
  const precision = normalizedUnit === 'ms' ? 1 : 0
  const displayUnit =
    normalizedUnit === 'kmh' ? 'km/h' : normalizedUnit === 'ms' ? 'm/s' : normalizedUnit
  const formatted = new Intl.NumberFormat('pt-BR', {
    maximumFractionDigits: precision,
  }).format(converted)

  return `${formatted} ${displayUnit}`
}

export function formatTime(value, format = '24h', timezone) {
  if (typeof value !== 'string' || !value) {
    return '—'
  }

  const localTime = value.match(/T(\d{2}):(\d{2})/)

  if (localTime) {
    const hour = Number(localTime[1])
    const minute = Number(localTime[2])

    if (hour > 23 || minute > 59) {
      return '—'
    }

    if (format === '12h') {
      return `${hour % 12 || 12}:${String(minute).padStart(2, '0')} ${hour < 12 ? 'AM' : 'PM'}`
    }

    return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return '—'
  }

  return new Intl.DateTimeFormat('pt-BR', {
    ...(timezone ? { timeZone: timezone } : {}),
    hour: 'numeric',
    minute: '2-digit',
    hour12: format === '12h',
  }).format(date)
}
