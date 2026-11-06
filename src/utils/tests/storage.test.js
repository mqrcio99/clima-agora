import assert from 'node:assert/strict'
import test from 'node:test'
import {
  DEFAULT_SETTINGS,
  SETTINGS_KEY,
  getFavorites,
  getPreferences,
  getSettings,
  getStoredCity,
  resetSettings,
  setFavorites,
  setPreferences,
  setSettings,
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

test('lê a cidade salva no formato legado do armazenamento', () => {
  globalThis.localStorage = makeStorage({
    values: {
      'clima-agora:last-city': '"Belo Horizonte"',
    },
  })

  assert.equal(getStoredCity(), 'Belo Horizonte')
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

test('usa padrões e valida cada campo das configurações', () => {
  globalThis.localStorage = makeStorage({
    values: {
      [SETTINGS_KEY]: JSON.stringify({
        version: 1,
        values: {
          theme: 'unknown',
          animations: 'fast',
          temperatureUnit: 'kelvin',
          windUnit: 'knots',
          timeFormat: '36h',
          useLocationOnOpen: 'yes',
          defaultCity: 'x'.repeat(200),
          ignored: 'discarded',
        },
      }),
    },
  })

  assert.deepEqual(getSettings(), DEFAULT_SETTINGS)
})

test('migra as preferências antigas para a chave versionada atual', () => {
  globalThis.localStorage = makeStorage({
    values: {
      'clima-agora:v1:preferences': JSON.stringify({ theme: 'dark', units: 'imperial' }),
    },
  })

  assert.deepEqual(getSettings(), {
    ...DEFAULT_SETTINGS,
    theme: 'dark',
    temperatureUnit: 'fahrenheit',
    windUnit: 'mph',
  })
  assert.equal(globalThis.localStorage.data.has(SETTINGS_KEY), true)
})

test('salva e restaura as configurações na chave própria', () => {
  globalThis.localStorage = makeStorage()

  setSettings({ temperatureUnit: 'fahrenheit', defaultCity: 'Campinas' })
  assert.equal(getSettings().temperatureUnit, 'fahrenheit')
  assert.equal(getSettings().defaultCity, 'Campinas')

  resetSettings()

  assert.deepEqual(getSettings(), DEFAULT_SETTINGS)
})

test('retorna padrões sem lançar quando o storage está indisponível', () => {
  globalThis.localStorage = makeStorage({ throwsOnSet: true })
  globalThis.localStorage.getItem = () => {
    throw new Error('storage indisponível')
  }

  assert.deepEqual(getSettings(), DEFAULT_SETTINGS)
  assert.doesNotThrow(() => setSettings({ theme: 'night' }))
})
