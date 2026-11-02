import assert from 'node:assert/strict'
import test from 'node:test'
import {
  getFavorites,
  getPreferences,
  getStoredCity,
  setFavorites,
  setPreferences,
  setStoredCity,
} from '../storage.js'

const makeStorage = ({ values = {}, throwsOnSet = false, throwsOnRemove = false } = {}) => ({
  data: new Map(Object.entries(values)),
  getItem(name) {
    return this.data.has(name) ? this.data.get(name) : null
  },
  setItem(name, value) {
    if (throwsOnSet) {
      throw new Error('storage indisponível')
    }
    this.data.set(name, String(value))
  },
  removeItem(name) {
    if (throwsOnRemove) {
      throw new Error('storage indisponível')
    }
    this.data.delete(name)
  },
})

test('lê a última cidade salva com segurança', () => {
  const key = 'clima-agora:v1:last-city'
  globalThis.localStorage = makeStorage({ values: { [key]: '"Campinas"' } })

  assert.equal(getStoredCity(), 'Campinas')
})

test('grava a última cidade sem quebrar quando o storage falha', () => {
  globalThis.localStorage = makeStorage({ throwsOnSet: true })

  assert.doesNotThrow(() => setStoredCity('Rio'))
  assert.equal(getStoredCity(), '')
})

test('retorna fallback seguro quando o JSON armazenado estiver corrompido', () => {
  globalThis.localStorage = makeStorage({
    values: {
      'clima-agora:v1:favorites': '{invalid-json',
    },
  })

  assert.deepEqual(getFavorites(), [])
  assert.deepEqual(getPreferences(), { theme: 'auto', units: 'metric' })
})

test('persiste favoritos e preferências em chaves versionadas', () => {
  globalThis.localStorage = makeStorage()

  setFavorites([{ city: 'Campinas', latitude: -22.9, longitude: -47.1 }])
  setPreferences({ theme: 'dark', units: 'metric' })

  assert.deepEqual(getFavorites(), [{ city: 'Campinas', latitude: -22.9, longitude: -47.1 }])
  assert.deepEqual(getPreferences(), { theme: 'dark', units: 'metric' })
})

test('remove a cidade quando o valor informado é vazio', () => {
  globalThis.localStorage = makeStorage({ values: { 'clima-agora:v1:last-city': '"São Paulo"' } })

  setStoredCity('   ')

  assert.equal(getStoredCity(), '')
})
