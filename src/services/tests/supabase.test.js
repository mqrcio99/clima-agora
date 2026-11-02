import assert from 'node:assert/strict'
import test from 'node:test'
import { getSession, getSupabaseClient, isSupabaseConfigured, signInWithSocial } from '../supabase.js'

test('configuração do Supabase fica inativa sem variáveis', () => {
  assert.equal(isSupabaseConfigured(), false)
  assert.equal(getSupabaseClient(), null)
})

test('auth social devolve erro amigável quando o cliente não está configurado', async () => {
  const result = await signInWithSocial('google')

  assert.equal(result.data, null)
  assert.equal(result.error instanceof Error, true)
  assert.match(result.error.message, /Supabase não está configurado/i)
})

test('sessão fica sem usuário quando o cliente não está configurado', async () => {
  const result = await getSession()

  assert.equal(result.error instanceof Error, true)
  assert.equal(result.data.session, null)
})
