import { useEffect, useState } from 'react'
import { getSupabaseClient, signOut } from '../services/supabase.js'

export function useAuth() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(() => !getSupabaseClient())
  const [error, setError] = useState('')

  useEffect(() => {
    const client = getSupabaseClient()

    if (!client) {
      return undefined
    }

    let mounted = true

    async function loadSession() {
      const { data, error: sessionError } = await client.auth.getSession()

      if (!mounted) {
        return
      }

      if (sessionError) {
        setError(sessionError.message)
        setSession(null)
      } else {
        setSession(data.session)
        setError('')
      }

      setLoading(false)
    }

    loadSession()

    const { data: authSubscription } = client.auth.onAuthStateChange((_, nextSession) => {
      if (!mounted) {
        return
      }

      setSession(nextSession)
      setError('')
    })

    return () => {
      mounted = false
      authSubscription?.subscription?.unsubscribe?.()
    }
  }, [])

  async function handleSignOut() {
    const response = await signOut()

    if (response?.error) {
      setError(response.error.message)
      return response
    }

    setSession(null)
    setError('')
    return response
  }

  return { session, loading, error, signOut: handleSignOut }
}
