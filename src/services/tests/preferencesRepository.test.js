import assert from 'node:assert/strict'
import test from 'node:test'
import { localPreferencesRepository } from '../preferencesRepository.js'
import { DEFAULT_SETTINGS, SETTINGS_KEY } from '../../utils/storage.js'

test('repositório local lê, salva configurações válidas e restaura padrões', () => {
  const values = new Map()
  globalThis.localStorage = {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: key => values.delete(key),
  }

  const saved = localPreferencesRepository.save({
    ...DEFAULT_SETTINGS,
    temperatureUnit: 'fahrenheit',
    windUnit: 'ms',
    timeFormat: '12h',
    theme: 'dark',
    defaultCity: 'Campinas',
    ignored: 'discarded',
  })

  assert.equal(saved.temperatureUnit, 'fahrenheit')
  assert.equal(saved.windUnit, 'ms')
  assert.equal(saved.timeFormat, '12h')
  assert.equal(saved.theme, 'dark')
  assert.equal(saved.defaultCity, 'Campinas')
  assert.equal(Object.hasOwn(saved, 'ignored'), false)
  assert.deepEqual(localPreferencesRepository.read(), saved)
  assert.equal(JSON.parse(values.get(SETTINGS_KEY)).version, 1)

  assert.deepEqual(localPreferencesRepository.reset(), DEFAULT_SETTINGS)
  assert.deepEqual(localPreferencesRepository.read(), DEFAULT_SETTINGS)
})
