import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'
import { useFavorites } from '../hooks/useFavorites.js'
import { isSupabaseConfigured, signInWithSocial } from '../services/supabase.js'
import { AppNavigation } from './AppNavigation.jsx'

function RouteLayout({ title, children }) {
  return (
    <main className="app-clima" data-theme="clear">
      <div className="conteudo-clima">
        <AppNavigation />
        <section className="app-route" aria-labelledby="route-title">
          <h1 id="route-title">{title}</h1>
          {children}
        </section>
      </div>
    </main>
  )
}

export function FavoritesPage() {
  const { favorites } = useFavorites()

  return (
    <RouteLayout title="Favoritos">
      {favorites.length ? (
        <ul className="favorites-list">
          {favorites.map(favorite => (
            <li
              className="favorites-list__item"
              key={`${favorite.city}-${favorite.latitude}-${favorite.longitude}`}
            >
              <span>{favorite.city}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="app-route__empty">Nenhuma cidade favorita por enquanto.</p>
      )}
      <Link className="app-route__action" to="/">
        Voltar ao clima
      </Link>
    </RouteLayout>
  )
}

export function AccountPage() {
  const { session, loading, error: sessionError, signOut } = useAuth()
  const [actionError, setActionError] = useState('')

  const handleSignIn = async () => {
    const { error: signInError } = await signInWithSocial('google')
    setActionError(signInError?.message ?? '')
  }

  const handleSignOut = async () => {
    const result = await signOut()
    setActionError(result?.error?.message ?? '')
  }

  return (
    <RouteLayout title="Conta">
      {!isSupabaseConfigured() ? (
        <p className="app-route__empty">A autenticação ainda não está configurada.</p>
      ) : session?.user ? (
        <div className="app-route__content">
          <p>Sessão iniciada como {session.user.email || 'usuário autenticado'}.</p>
          <button
            className="app-route__action"
            type="button"
            onClick={handleSignOut}
            disabled={loading}
          >
            Sair
          </button>
        </div>
      ) : (
        <div className="app-route__content">
          <p>Entre para sincronizar seus dados entre dispositivos.</p>
          <button
            className="app-route__action"
            type="button"
            onClick={handleSignIn}
            disabled={loading}
          >
            Entrar com Google
          </button>
        </div>
      )}
      {(sessionError || actionError) && (
        <p className="app-route__error" role="alert">
          {actionError || sessionError}
        </p>
      )}
    </RouteLayout>
  )
}

export function SettingsPage() {
  return (
    <RouteLayout title="Configurações">
      <p className="app-route__empty">
        Os ajustes desta página serão definidos no plano de implementação.
      </p>
    </RouteLayout>
  )
}

export function NotFoundPage() {
  return (
    <RouteLayout title="Página não encontrada">
      <p className="app-route__empty">Este endereço não corresponde a uma página do Clima Agora.</p>
      <Link className="app-route__action" to="/">
        Ir para o clima
      </Link>
    </RouteLayout>
  )
}
