import { Settings, UserRound } from 'lucide-react'
import { NavLink } from 'react-router-dom'

const PRIMARY_ROUTES = [
  { to: '/', label: 'Clima', end: true },
  { to: '/favoritos', label: 'Favoritos' },
]

function PrimaryLinks({ className }) {
  return (
    <nav className={className} aria-label="Navegação principal">
      {PRIMARY_ROUTES.map(route => (
        <NavLink
          className={({ isActive }) =>
            `app-navigation__link${isActive ? ' app-navigation__link--active' : ''}`
          }
          end={route.end}
          key={route.to}
          to={route.to}
        >
          {route.label}
        </NavLink>
      ))}
    </nav>
  )
}

export function AppNavigation() {
  return (
    <>
      <PrimaryLinks className="app-navigation app-navigation--desktop" />
      <nav className="app-navigation__actions" aria-label="Conta e configurações">
        <NavLink
          aria-label="Conta"
          className={({ isActive }) =>
            `app-navigation__icon-link${isActive ? ' app-navigation__icon-link--active' : ''}`
          }
          title="Conta"
          to="/conta"
        >
          <UserRound aria-hidden="true" size={20} strokeWidth={1.8} />
        </NavLink>
        <NavLink
          aria-label="Configurações"
          className={({ isActive }) =>
            `app-navigation__icon-link${isActive ? ' app-navigation__icon-link--active' : ''}`
          }
          title="Configurações"
          to="/configuracoes"
        >
          <Settings aria-hidden="true" size={20} strokeWidth={1.8} />
        </NavLink>
      </nav>
      <PrimaryLinks className="app-navigation app-navigation--mobile" />
    </>
  )
}
