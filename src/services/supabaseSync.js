import { getFavorites, getPreferences } from '../utils/storage.js'
import { getCurrentUser, getSupabaseClient } from './supabase.js'

function normalizeRemoteFavorite(row) {
  return {
    city: row.city_name,
    latitude: Number(row.latitude),
    longitude: Number(row.longitude),
  }
}

export async function loadRemoteFavorites() {
  const client = getSupabaseClient()

  if (!client) {
    return []
  }

  const user = await getCurrentUser()

  if (!user) {
    return []
  }

  const { data, error } = await client
    .from('favorites')
    .select('user_id, city_name, latitude, longitude, display_name')
    .eq('user_id', user.id)

  if (error || !Array.isArray(data)) {
    return []
  }

  return data.map(normalizeRemoteFavorite)
}

export async function syncLocalFavoritesToSupabase() {
  const client = getSupabaseClient()

  if (!client) {
    return { synced: false, error: new Error('Supabase não está configurado.') }
  }

  const user = await getCurrentUser()

  if (!user) {
    return { synced: false, error: new Error('Usuário não autenticado.') }
  }

  const localFavorites = getFavorites()
  const remoteFavorites = await loadRemoteFavorites()
  const remoteMap = new Map(
    remoteFavorites.map(item => [`${item.city.toLowerCase()}-${Number(item.latitude).toFixed(2)}-${Number(item.longitude).toFixed(2)}`, item]),
  )

  const mergedFavorites = [...remoteFavorites]

  for (const favorite of localFavorites) {
    const key = `${favorite.city.toLowerCase()}-${Number(favorite.latitude).toFixed(2)}-${Number(favorite.longitude).toFixed(2)}`

    if (!remoteMap.has(key)) {
      mergedFavorites.push(favorite)
    }
  }

  const rows = mergedFavorites.map(favorite => ({
    user_id: user.id,
    city_name: favorite.city,
    display_name: favorite.city,
    latitude: Number(favorite.latitude),
    longitude: Number(favorite.longitude),
  }))

  const { error } = await client.from('favorites').upsert(rows, { onConflict: 'user_id, city_name' })

  return {
    synced: !error,
    error,
    favorites: mergedFavorites,
  }
}

export async function loadRemotePreferences() {
  const client = getSupabaseClient()

  if (!client) {
    return { ...getPreferences() }
  }

  const user = await getCurrentUser()

  if (!user) {
    return { ...getPreferences() }
  }

  const { data, error } = await client
    .from('preferences')
    .select('unit_system, theme_preference, default_city')
    .eq('user_id', user.id)
    .maybeSingle()

  if (error || !data) {
    return { ...getPreferences() }
  }

  return {
    theme: data.theme_preference ?? 'auto',
    units: data.unit_system ?? 'metric',
    defaultCity: data.default_city ?? null,
  }
}
