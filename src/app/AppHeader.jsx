import { Link } from 'react-router-dom'
import { AppNavigation } from './AppNavigation.jsx'

export function AppHeader() {
  return (
    <header className="app-header">
      <Link aria-label="Clima Agora: página do clima" className="marca" to="/">
        <span className="marca__icone" aria-hidden="true">
          ☀
        </span>
        <span>Clima Agora</span>
      </Link>
      <AppNavigation />
    </header>
  )
}