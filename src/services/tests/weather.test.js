import assert from 'node:assert/strict'
import test from 'node:test'
import { fetchWeather } from '../weather.js'

function mockFetch(t, implementation) {
  const originalFetch = globalThis.fetch
  globalThis.fetch = implementation
  t.after(() => {
    globalThis.fetch = originalFetch
  })
}

test('solicita 16 dias, mantém o fuso automático e devolve dados incompletos', async t => {
  const payload = { timezone: 'America/Sao_Paulo', current: { temperature_2m: null } }
  mockFetch(t, async url => {
    const requestUrl = new URL(url)
    assert.equal(requestUrl.searchParams.get('forecast_days'), '16')
    assert.equal(requestUrl.searchParams.get('timezone'), 'auto')
    return { ok: true, json: async () => payload }
  })

  assert.deepEqual(await fetchWeather(-23.551, -46.631), payload)
})

test('rejeita respostas HTTP malsucedidas', async t => {
  mockFetch(t, async () => ({ ok: false, status: 502 }))
  await assert.rejects(fetchWeather(12.345, 67.891), /API \(502\)/)
})

test('compartilha uma chamada simultânea para as mesmas coordenadas', async t => {
  let callCount = 0
  mockFetch(t, async () => {
    callCount += 1
    return { ok: true, json: async () => ({ current: { temperature_2m: 18 } }) }
  })

  const [first, second] = await Promise.all([
    fetchWeather(45.123, 12.456),
    fetchWeather(45.123, 12.456),
  ])

  assert.equal(callCount, 1)
  assert.deepEqual(first, second)
})

test('informa timeout da consulta meteorológica', async t => {
  mockFetch(
    t,
    (_url, { signal }) =>
      new Promise((resolve, reject) => {
        signal.addEventListener('abort', () => reject(new Error('aborted')), { once: true })
      }),
  )

  await assert.rejects(fetchWeather(78.123, 34.567, { timeoutMs: 1 }), /tempo limite/)
})
