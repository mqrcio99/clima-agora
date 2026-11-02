import { createClient } from '@supabase/supabase-js'

const environment =
  typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env : {}

const supabaseUrl = environment.VITE_SUPABASE_URL ?? ''
const supabaseAnonKey = environment.VITE_SUPABASE_ANON_KEY ?? ''

export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      })
    : null

export function isSupabaseConfigured() {
  return Boolean(supabase)
}

export function getSupabaseClient() {
  return supabase
}

export async function signInWithSocial(provider = 'google', redirectTo = null) {
  if (!supabase) {
    return {
      data: null,
      error: new Error('Supabase não está configurado. Defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.'),
    }
  }

  const resolvedRedirectTo =
    redirectTo ?? (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173')

  return supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: resolvedRedirectTo,
    },
  })
}

export async function signOut() {
  if (!supabase) {
    return {
      error: new Error('Supabase não está configurado. Defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.'),
    }
  }

  return supabase.auth.signOut()
}

export async function getSession() {
  if (!supabase) {
    return {
      data: { session: null },
      error: new Error('Supabase não está configurado. Defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.'),
    }
  }

  return supabase.auth.getSession()
}

export async function getCurrentUser() {
  if (!supabase) {
    return null
  }

  const { data } = await supabase.auth.getUser()
  return data?.user ?? null
}
