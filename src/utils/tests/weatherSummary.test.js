import assert from 'node:assert/strict'
import test from 'node:test'
import { getWeatherSummary } from '../weatherSummary.js'

test('monta resumos das condições atuais, hoje e amanhã', () => {
  const summary = getWeatherSummary({
    current: { temperature_2m: 24, weather_code: 61 },
    daily: {
      temperature_2m_min: [15, 16],
      temperature_2m_max: [22, 23],
      precipitation_probability_max: [40, 60],
      weather_code: [3, 0],
    },
  })

  assert.deepEqual(summary, {
    agora: { icone: '🌧️', temperatura: 24 },
    hoje: { min: 15, max: 22, chuvaProb: 40 },
    amanha: { icone: '☀️', min: 16, max: 23 },
    quinzeDias: { min: 15, max: 23, diasComChuva: 1 },
  })
})

test('mantém campos nulos quando a resposta não contém os dados', () => {
  const summary = getWeatherSummary({
    current: { temperature_2m: null, weather_code: null },
    daily: {
      temperature_2m_min: [null],
      temperature_2m_max: [null],
      precipitation_probability_max: [null],
      weather_code: [null],
    },
  })

  assert.deepEqual(summary, {
    agora: { icone: null, temperatura: null },
    hoje: { min: null, max: null, chuvaProb: null },
    amanha: { icone: null, min: null, max: null },
    quinzeDias: { min: null, max: null, diasComChuva: 0 },
  })
})

test('resume no máximo 16 dias e aplica o limite configurável de chuva', () => {
  const summary = getWeatherSummary(
    {
      daily: {
        temperature_2m_min: Array.from({ length: 17 }, (_, index) => index - 5),
        temperature_2m_max: Array.from({ length: 17 }, (_, index) => index + 10),
        precipitation_probability_max: [50, 51, 60, ...Array(13).fill(50), 100],
      },
    },
    { rainProbabilityThreshold: 50 },
  )

  assert.equal(summary.quinzeDias.min, -5)
  assert.equal(summary.quinzeDias.max, 25)
  assert.equal(summary.quinzeDias.diasComChuva, 2)
})
