import assert from 'node:assert/strict'
import test from 'node:test'
import { getHourlyForecastOverview, getRainRiskLevel } from '../hourlyForecast.js'

test('gera previsão horária com rótulo e risco de chuva', () => {
  const overview = getHourlyForecastOverview({
    time: ['2026-10-13T12:00', '2026-10-13T13:00', '2026-10-13T14:00'],
    temperature_2m: [24, 22, 21],
    precipitation_probability: [15, 70, 85],
    precipitation: [0, 1.2, 3.5],
    weather_code: [0, 61, 80],
  })

  assert.equal(overview.length, 3)
  assert.equal(overview[0].label, 'Agora')
  assert.equal(overview[1].chance, 70)
  assert.equal(overview[2].rain, 3.5)
  assert.equal(getRainRiskLevel(overview), 'chuva intensa')
})
