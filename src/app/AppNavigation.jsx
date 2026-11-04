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
          <svg aria-hidden="true" viewBox="0 0 24 24">
            <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm0 2c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5Z" />
          </svg>
        </NavLink>
        <NavLink
          aria-label="Configurações"
          className={({ isActive }) =>
            `app-navigation__icon-link${isActive ? ' app-navigation__icon-link--active' : ''}`
          }
          title="Configurações"
          to="/configuracoes"
        >
          <svg aria-hidden="true" viewBox="0 0 24 24">
            <path d="m19.4 13.5 1.4 1.1-1.4 2.4-1.7-.6a7.8 7.8 0 0 1-1.6.9l-.3 1.8h-2.8l-.3-1.8a7.8 7.8 0 0 1-1.6-.9l-1.7.6-1.4-2.4 1.4-1.1a7 7 0 0 1 0-1.9L5.9 10.5l1.4-2.4 1.7.6a7.8 7.8 0 0 1 1.6-.9l.3-1.8h2.8l.3 1.8a7.8 7.8 0 0 1 1.6.9l1.7-.6 1.4 2.4-1.4 1.1a7 7 0 0 1 .1 1.9ZM12.4 15a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
          </svg>
        </NavLink>
      </nav>
      <PrimaryLinks className="app-navigation app-navigation--mobile" />
    </>
  )
}
