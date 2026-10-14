import assert from 'node:assert/strict'
import test from 'node:test'
import { getStoredCity, setStoredCity } from '../storage.js'

test('lê a última cidade salva com segurança', () => {
  const key = 'clima-agora:last-city'
  globalThis.localStorage = {
    getItem: name => (name === key ? 'Campinas' : null),
    setItem: () => {},
    removeItem: () => {},
  }

  assert.equal(getStoredCity(), 'Campinas')
})

test('grava a última cidade sem quebrar quando o storage falha', () => {
  globalThis.localStorage = {
    getItem: () => null,
    setItem: () => {
      throw new Error('storage indisponível')
    },
    removeItem: () => {},
  }

  assert.doesNotThrow(() => setStoredCity('Rio'))
  assert.equal(getStoredCity(), '')
})
