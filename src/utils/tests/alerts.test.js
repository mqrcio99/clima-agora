import assert from 'node:assert/strict'
import test from 'node:test'
import { getWeatherAlerts } from '../alerts.js'

test('gera alertas para chuva, vento, calor e uv alto', () => {
  const alerts = getWeatherAlerts({
    current: {
      temperature_2m: 34,
      wind_speed_10m: 45,
      wind_gusts_10m: 55,
      weather_code: 0,
      uv_index: 8,
    },
    hourly: {
      precipitation_probability: [20, 75, 88],
      precipitation: [0, 2.5, 4.1],
    },
    daily: {
      uv_index_max: [8],
    },
  })

  assert.ok(alerts.some(item => item.key === 'rain'))
  assert.ok(alerts.some(item => item.key === 'wind'))
  assert.ok(alerts.some(item => item.key === 'heat'))
  assert.ok(alerts.some(item => item.key === 'uv'))
})
