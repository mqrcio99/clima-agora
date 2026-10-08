import assert from 'node:assert/strict'
import test from 'node:test'
import { getWeatherCondition } from '../weatherCondition.js'

test('prioriza tempestades', () => {
  assert.equal(getWeatherCondition({ weatherCode: 95, temperature: 30, isDay: 1 }), 'storm')
})

test('classifica neve e chuva', () => {
  assert.equal(getWeatherCondition({ weatherCode: 71, temperature: 5, isDay: 1 }), 'snow')
  assert.equal(getWeatherCondition({ weatherCode: 61, temperature: 15, isDay: 1 }), 'rain')
})

test('classifica frio e céu claro', () => {
  assert.equal(getWeatherCondition({ weatherCode: 0, temperature: 8, isDay: 1 }), 'cold')
  assert.equal(getWeatherCondition({ weatherCode: 0, temperature: 25, isDay: 1 }), 'clear')
  assert.equal(getWeatherCondition({ weatherCode: 0, temperature: 25, isDay: 0 }), 'night')
})
