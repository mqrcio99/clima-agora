import { useEffect, useRef, useState } from 'react'
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
        ? `${Math.round(itemSummary.min)}°/${Math.round(itemSummary.max)}° · ${Math.round(itemSummary.chuvaProb)}%`
        : null
    case 'amanha':
      return itemSummary.icone && [itemSummary.min, itemSummary.max].every(Number.isFinite)
        ? `${itemSummary.icone} ${Math.round(itemSummary.min)}°/${Math.round(itemSummary.max)}°`
        : null
    case 'quinzeDias':
      return [itemSummary.min, itemSummary.max, itemSummary.diasComChuva].every(Number.isFinite)
        ? `${Math.round(itemSummary.min)}°/${Math.round(itemSummary.max)}° · ${itemSummary.diasComChuva} chuvosos`
        : null
    default:
      return null
  }
}

function getCompactSummaryText(item, summary) {
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
      return [itemSummary.min, itemSummary.max].every(Number.isFinite)
        ? `${Math.round(itemSummary.min)}°/${Math.round(itemSummary.max)}°`
        : null
    case 'amanha':
      return itemSummary.icone && [itemSummary.min, itemSummary.max].every(Number.isFinite)
        ? `${itemSummary.icone} ${Math.round(itemSummary.min)}°/${Math.round(itemSummary.max)}°`
        : null
    case 'quinzeDias':
      return Number.isFinite(itemSummary.diasComChuva)
        ? `${itemSummary.diasComChuva} chuvosos`
        : null
    default:
      return null
  }
}

function scrollToSection(event, item) {
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
  const headerRef = useRef(null)
  const menuButtonRef = useRef(null)
  const navigationRef = useRef(null)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    if (!menuOpen) {
      return undefined
    }

    const handleKeyDown = event => {
      if (event.key === 'Escape') {
        setMenuOpen(false)
        menuButtonRef.current?.focus()
      }
    }
    const handlePointerDown = event => {
      if (!headerRef.current?.contains(event.target)) {
        setMenuOpen(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('pointerdown', handlePointerDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('pointerdown', handlePointerDown)
    }
  }, [menuOpen])

  useEffect(() => {
    if (menuOpen) {
      navigationRef.current?.querySelector('a')?.focus()
    }
  }, [menuOpen])

  return (
    <header className={`cabecalho${menuOpen ? ' cabecalho--menu-aberto' : ''}`} ref={headerRef}>
      <div className="marca">
        <span className="marca__icone" aria-hidden="true">
          ☀
        </span>
        <span>Clima Agora</span>
      </div>

      <button
        className="cabecalho__menu"
        type="button"
        aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
        aria-expanded={menuOpen}
        aria-controls="navegacao-clima"
        ref={menuButtonRef}
        onClick={() => setMenuOpen(open => !open)}
      >
        <span aria-hidden="true">{menuOpen ? '×' : '☰'}</span>
      </button>

      <div className="cabecalho__navegacao-grupo">
        <nav
          className="cabecalho__navegacao"
          id="navegacao-clima"
          aria-label="Previsão do tempo"
          ref={navigationRef}
        >
          {items.map(item => {
            const summaryText = error ? null : getSummaryText(item, resumo)
            const compactSummaryText = error ? null : getCompactSummaryText(item, resumo)

            return (
              <a
                className="cabecalho__link"
                href={item.href}
                key={item.id}
                onClick={event => {
                  scrollToSection(event, item)
                  setMenuOpen(false)
                }}
              >
                <span>{item.label}</span>
                {loading && !error ? (
                  <span className="cabecalho__skeleton" aria-hidden="true" />
                ) : summaryText ? (
                  <>
                    <span className="cabecalho__resumo cabecalho__resumo--completo">
                      {summaryText}
                    </span>
                    {compactSummaryText && (
                      <span className="cabecalho__resumo cabecalho__resumo--compacto">
                        {compactSummaryText}
                      </span>
                    )}
                  </>
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
