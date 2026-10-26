import { useRef } from 'react'
import { CitySearch } from '../CitySearch/CitySearch.jsx'

function getSummaryText(item, summary) {
  const itemSummary = summary?.[item.resumo]

  if (!itemSummary) {
    return null
  }

  switch (item.resumo) {
    case 'agora':
      return itemSummary.icone && Number.isFinite(itemSummary.temperatura)
        ? `${itemSummary.icone} ${Math.round(itemSummary.temperatura)}°`
        : null
    case 'hoje':
      return [itemSummary.min, itemSummary.max, itemSummary.chuvaProb].every(Number.isFinite)
        ? `${Math.round(itemSummary.min)}°/${Math.round(itemSummary.max)}° · ${Math.round(itemSummary.chuvaProb)}% chuva`
        : null
    case 'amanha':
      return itemSummary.icone && [itemSummary.min, itemSummary.max].every(Number.isFinite)
        ? `${itemSummary.icone} ${Math.round(itemSummary.min)}°/${Math.round(itemSummary.max)}°`
        : null
    case 'quinzeDias':
      return [itemSummary.min, itemSummary.max, itemSummary.diasComChuva].every(Number.isFinite)
        ? `${Math.round(itemSummary.min)}°/${Math.round(itemSummary.max)}° · ${itemSummary.diasComChuva} dias de chuva`
        : null
    default:
      return null
  }
}

function scrollToSection(event, item) {
  event.preventDefault()
  document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

export function Header({
  items,
  resumo,
  loading,
  error,
  cityInput,
  city,
  locationDenied,
  onCityChange,
  onSearch,
}) {
  const searchInputRef = useRef(null)

  return (
    <header className="cabecalho">
      <div className="marca">
        <span className="marca__icone" aria-hidden="true">
          ☀
        </span>
        <span>Clima Agora</span>
      </div>

      <div className="cabecalho__navegacao-grupo">
        <nav className="cabecalho__navegacao" aria-label="Previsão do tempo">
          {items.map(item => {
            const summaryText = error ? null : getSummaryText(item, resumo)

            return (
              <a
                className="cabecalho__link"
                href={item.href}
                key={item.id}
                onClick={event => scrollToSection(event, item)}
              >
                <span>{item.label}</span>
                {loading && !error ? (
                  <span className="cabecalho__skeleton" aria-hidden="true" />
                ) : summaryText ? (
                  <span className="cabecalho__resumo">{summaryText}</span>
                ) : null}
              </a>
            )
          })}
        </nav>
        <div className="cabecalho__localizacao" aria-live="polite">
          <span className="cabecalho__localizacao-icone" aria-hidden="true">
            <svg viewBox="0 0 24 24" focusable="false">
              <path d="M12 22s8-7.2 8-13a8 8 0 1 0-16 0c0 5.8 8 13 8 13Zm0-10a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z" />
            </svg>
          </span>
          <span className="cabecalho__localizacao-nome">{city}</span>
          <button
            className="cabecalho__alterar"
            type="button"
            onClick={() => searchInputRef.current?.focus()}
          >
            Alterar
          </button>
          {locationDenied && (
            <span className="cabecalho__localizacao-aviso">
              Permita a localização para ver dados do seu local
            </span>
          )}
        </div>
      </div>

      <CitySearch
        inputRef={searchInputRef}
        value={cityInput}
        onChange={onCityChange}
        onSearch={onSearch}
        disabled={loading}
      />
    </header>
  )
}
