import { lazy } from 'react'
import { Forecast } from '../components/Forecast/Forecast.jsx'
import { LocationTransition } from '../components/LocationTransition'
import { WeatherCard } from '../components/WeatherCard/WeatherCard.jsx'
import { BrowserRouter, Route, Routes, useOutletContext } from 'react-router-dom'
import { AppLayout } from './AppLayout.jsx'
import { PageHeading } from './PageHeading.jsx'
import { PreferencesProvider } from '../hooks/usePreferences.js'
import '../styles/tokens.css'
import '../styles/themes.css'
const loadPages = () => import('./StaticPages.jsx')
const FavoritesPage = lazy(() => loadPages().then(module => ({ default: module.FavoritesPage })))
const AccountPage = lazy(() => loadPages().then(module => ({ default: module.AccountPage })))
const SettingsPage = lazy(() => loadPages().then(module => ({ default: module.SettingsPage })))
const NotFoundPage = lazy(() => loadPages().then(module => ({ default: module.NotFoundPage })))

function WeatherPage() {
  const { data, loading, error, condition, preferences } = useOutletContext()

  return (
    <>
      <PageHeading documentTitle="Clima Agora — previsão do tempo">Clima</PageHeading>
      <div className="grade-clima">
        <div id="agora" className="ancora-clima">
          {loading && !data ? (
            <LocationTransition />
          ) : (
            <WeatherCard
              data={data}
              loading={loading}
              error={error}
              condition={condition}
              preferences={preferences}
            />
          )}
        </div>
        <Forecast data={data} preferences={preferences} />
      </div>
      <div className="secoes-previsao">
        <Forecast
          data={data}
          id="quinze-dias"
          title="Hoje e os próximos 15 dias"
          daysToShow={16}
          showHourly={false}
          preferences={preferences}
        />
      </div>
      {error && data && (
        <p className="error-note" role="alert">
          {error}
        </p>
      )}
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <PreferencesProvider>
        <Routes>
          <Route element={<AppLayout />}>
            <Route index element={<WeatherPage />} />
            <Route path="favoritos" element={<FavoritesPage />} />
            <Route path="conta" element={<AccountPage />} />
            <Route path="configuracoes" element={<SettingsPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </PreferencesProvider>
    </BrowserRouter>
  )
}
