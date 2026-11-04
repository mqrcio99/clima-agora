import assert from 'node:assert/strict'
import test from 'node:test'
import {
  convertTemperature,
  convertWindSpeed,
  formatTemperature,
  formatTime,
  formatWindSpeed,
} from '../format.js'

test('converte Celsius para Fahrenheit sem alterar valores ausentes', () => {
  assert.equal(convertTemperature(0, 'fahrenheit'), 32)
  assert.equal(convertTemperature(20, 'celsius'), 20)
  assert.equal(convertTemperature(null, 'fahrenheit'), null)
  assert.equal(formatTemperature(20, 'fahrenheit'), '68°F')
  assert.equal(formatTemperature(null, 'celsius'), '—')
})

test('converte vento em km/h para as unidades selecionadas', () => {
  assert.equal(convertWindSpeed(36, 'ms'), 10)
  assert.equal(convertWindSpeed(36, 'mph'), 22.3694)
  assert.equal(formatWindSpeed(36, 'kmh'), '36 km/h')
  assert.equal(formatWindSpeed(36, 'ms'), '10 m/s')
  assert.equal(formatWindSpeed(null, 'mph'), '—')
})

test('formata hora local em 24 ou 12 horas', () => {
  assert.equal(formatTime('2026-04-04T00:05', '24h'), '00:05')
  assert.equal(formatTime('2026-04-04T13:15', '12h'), '1:15 PM')
  assert.equal(formatTime('invalid', '24h'), '—')
})
