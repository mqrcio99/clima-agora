import { NavLink } from 'react-router-dom'

const APP_ROUTES = [
  { to: '/', label: 'Clima', end: true },
  { to: '/favoritos', label: 'Favoritos' },
  { to: '/conta', label: 'Conta' },
  { to: '/configuracoes', label: 'Configurações' },
]

export function AppNavigation() {
  return (
    <nav className="app-navigation" aria-label="Navegação principal">
      {APP_ROUTES.map(route => (
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
