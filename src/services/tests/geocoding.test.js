import assert from 'node:assert/strict'
import test from 'node:test'
import { getCityFromCoordinates, searchCoordinates } from '../geocoding.js'

function mockFetch(t, implementation) {
  const originalFetch = globalThis.fetch
  globalThis.fetch = implementation
  t.after(() => {
    globalThis.fetch = originalFetch
  })
}

test('procura coordenadas e nome da cidade', async t => {
  mockFetch(t, async url => {
    const requestUrl = new URL(url)
    assert.equal(requestUrl.searchParams.get('name'), 'São Paulo')
    return {
      ok: true,
      json: async () => ({ results: [{ latitude: -23.55, longitude: -46.63, name: 'São Paulo' }] }),
    }
  })

  assert.deepEqual(await searchCoordinates('São Paulo'), {
    latitude: -23.55,
    longitude: -46.63,
    city: 'São Paulo',
  })
})

test('informa falha HTTP e cidade não encontrada', async t => {
  mockFetch(t, async () => ({ ok: false, status: 503 }))
  await assert.rejects(searchCoordinates('Lisboa'), /API \(503\)/)

  globalThis.fetch = async () => ({ ok: true, json: async () => ({ results: [] }) })
  await assert.rejects(searchCoordinates('Cidade inexistente'), /Cidade não encontrada/)
})

test('consulta a localidade por coordenadas', async t => {
  mockFetch(t, async url => {
    const requestUrl = new URL(url)
    assert.equal(requestUrl.searchParams.get('latitude'), '-23.5')
    assert.equal(requestUrl.searchParams.get('longitude'), '-46.6')
    return { ok: true, json: async () => ({ locality: 'São Paulo' }) }
  })

  assert.equal(await getCityFromCoordinates(-23.5, -46.6), 'São Paulo')
})

test('informa timeout da consulta de geocodificação', async t => {
  mockFetch(
    t,
    (_url, { signal }) =>
      new Promise((resolve, reject) => {
        signal.addEventListener('abort', () => reject(new Error('aborted')), { once: true })
      }),
  )

  await assert.rejects(searchCoordinates('Lisboa', { timeoutMs: 1 }), /tempo limite/)
})
