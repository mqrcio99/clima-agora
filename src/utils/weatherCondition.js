import { COLD_TEMPERATURE_LIMIT, WEATHER_CODES } from './weatherCodes.js'

export function getWeatherCondition({ weatherCode, temperature, isDay }) {
  const code = Number(weatherCode)

  if ([95, 96, 99].includes(code)) {
    return 'storm'
  }

  if ([71, 72, 73, 74, 75, 76, 77, 85, 86].includes(code)) {
    return 'snow'
  }

  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) {
    return 'rain'
  }

  if (temperature <= COLD_TEMPERATURE_LIMIT) {
    return 'cold'
  }

  if ([2, 3, 45, 48].includes(code)) {
    return 'cloudy'
  }

  if ([0, 1].includes(code) && isDay === 1) {
    return 'clear'
  }

  if ([0, 1].includes(code) && isDay === 0) {
    return 'night'
  }

  return WEATHER_CODES[code] || 'clear'
}
