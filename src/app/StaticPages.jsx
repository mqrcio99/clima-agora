import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useFavorites } from '../hooks/useFavorites.js'
import { usePreferences } from '../hooks/usePreferences.js'
import { PageHeading } from './PageHeading.jsx'

function RoutePage({ title, documentTitle, children }) {
  return (
    <section className="app-route" aria-labelledby="route-title">
      <PageHeading documentTitle={documentTitle}>{title}</PageHeading>
      {children}
    </section>
  )
}

function ContinueWithoutLogin() {
  return (
    <Link className="app-route__action app-route__action--icon" to="/">
      Continuar sem login
      <ArrowRight aria-hidden="true" size={16} />
    </Link>
  )
}

export function FavoritesPage() {
  const { favorites } = useFavorites()

  return (
    <RoutePage title="Favoritos" documentTitle="Favoritos — Clima Agora">
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
    </RoutePage>
  )
}

export function AccountPage() {
  return (
    <RoutePage title="Conta" documentTitle="Conta — Clima Agora">
      <div className="app-route__content">
        <p>O app está no modo local. Seus dados permanecem salvos neste dispositivo.</p>
        <ContinueWithoutLogin />
      </div>
    </RoutePage>
  )
}

export function SettingsPage() {
  const { preferences, setPreferences, resetPreferences } = usePreferences()

  const updateSetting = (key, value) => {
    setPreferences({ [key]: value })
  }

  return (
    <RoutePage title="Configurações" documentTitle="Configurações — Clima Agora">
      <div className="settings-panel" aria-label="Configurações do app">
        <div className="settings-group">
          <label htmlFor="settings-theme">Tema</label>
          <select
            id="settings-theme"
            value={preferences.theme}
            onChange={event => updateSetting('theme', event.target.value)}
          >
            <option value="auto">Automático</option>
            <option value="light">Claro</option>
            <option value="dark">Escuro</option>
          </select>
        </div>

        <div className="settings-group">
          <label htmlFor="settings-temperatureUnit">Unidade de temperatura</label>
          <select
            id="settings-temperatureUnit"
            value={preferences.temperatureUnit}
            onChange={event => updateSetting('temperatureUnit', event.target.value)}
          >
            <option value="celsius">Celsius (°C)</option>
            <option value="fahrenheit">Fahrenheit (°F)</option>
          </select>
        </div>

        <div className="settings-group">
          <label htmlFor="settings-windUnit">Unidade do vento</label>
          <select
            id="settings-windUnit"
            value={preferences.windUnit}
            onChange={event => updateSetting('windUnit', event.target.value)}
          >
            <option value="kmh">Quilômetros por hora (km/h)</option>
            <option value="ms">Metros por segundo (m/s)</option>
            <option value="mph">Milhas por hora (mph)</option>
          </select>
        </div>

        <div className="settings-group">
          <label htmlFor="settings-timeFormat">Formato de hora</label>
          <select
            id="settings-timeFormat"
            value={preferences.timeFormat}
            onChange={event => updateSetting('timeFormat', event.target.value)}
          >
            <option value="24h">24 horas</option>
            <option value="12h">12 horas</option>
          </select>
        </div>

        <div className="settings-group">
          <label htmlFor="settings-defaultCity">Cidade padrão</label>
          <input
            id="settings-defaultCity"
            type="text"
            value={preferences.defaultCity}
            onChange={event => updateSetting('defaultCity', event.target.value)}
            placeholder="Ex.: São Paulo"
          />
        </div>

        <div className="settings-actions">
          <button type="button" className="app-route__action" onClick={resetPreferences}>
            Restaurar padrões
          </button>
          <p className="settings-note">Essas preferências ficam salvas no navegador deste dispositivo.</p>
        </div>
      </div>
    </RoutePage>
  )
}

export function NotFoundPage() {
  return (
    <RoutePage title="Página não encontrada" documentTitle="Página não encontrada — Clima Agora">
      <p className="app-route__empty">Este endereço não corresponde a uma página do Clima Agora.</p>
      <Link className="app-route__action" to="/">
        Ir para o clima
      </Link>
    </RoutePage>
  )
}
