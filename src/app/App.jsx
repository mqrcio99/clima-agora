import { lazy, useOutletContext } from 'react'
import { Forecast } from '../components/Forecast/Forecast.jsx'
import { LocationTransition } from '../components/LocationTransition'
import { WeatherCard } from '../components/WeatherCard/WeatherCard.jsx'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AppLayout } from './AppLayout.jsx'
import { PageHeading } from './PageHeading.jsx'
import '../styles/tokens.css'
import '../styles/themes.css'
const loadPages = () => import('./StaticPages.jsx')
const FavoritesPage = lazy(() => loadPages().then(module => ({ default: module.FavoritesPage })))
const AccountPage = lazy(() => loadPages().then(module => ({ default: module.AccountPage })))
const SettingsPage = lazy(() => loadPages().then(module => ({ default: module.SettingsPage })))
const NotFoundPage = lazy(() => loadPages().then(module => ({ default: module.NotFoundPage })))

function WeatherPage() {
  const { data, loading, error, condition } = useOutletContext()

  return (
    <>
      <PageHeading documentTitle="Clima Agora — previsão do tempo">Clima</PageHeading>
      <div className="grade-clima">
        <div id="agora" className="ancora-clima">
          {loading && !data ? (
            <LocationTransition />
          ) : (
            <WeatherCard data={data} loading={loading} error={error} condition={condition} />
          )}
        </div>
        <Forecast data={data} />
      </div>
      <div className="secoes-previsao">
        <Forecast
          data={data}
          id="quinze-dias"
          title="Hoje e os próximos 15 dias"
          daysToShow={16}
          showHourly={false}
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
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<WeatherPage />} />
          <Route path="favoritos" element={<FavoritesPage />} />
          <Route path="conta" element={<AccountPage />} />
          <Route path="configuracoes" element={<SettingsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
