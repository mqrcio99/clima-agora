const CONDICOES = [
  { key: 'clear', label: 'Ensolarado' },
  { key: 'rain', label: 'Chuva' },
  { key: 'cold', label: 'Frio' },
  { key: 'snow', label: 'Neve' },
  { key: 'cloudy', label: 'Nublado' },
  { key: 'night', label: 'Noite' },
  { key: 'storm', label: 'Tempestade' },
]

export default function Playground() {
  const current = (() => {
    if (typeof window === 'undefined') {
      return 'clear'
    }

    const params = new URLSearchParams(window.location.search)
    const value = params.get('debug')
    return CONDICOES.some(item => item.key === value) ? value : 'clear'
  })()

  const aplicarCondicao = proximaCondicao => {
    if (typeof window === 'undefined') {
      return
    }

    const params = new URLSearchParams(window.location.search)
    params.set('debug', proximaCondicao)
    const query = params.toString()
    const novaUrl = `${window.location.pathname}${query ? `?${query}` : ''}`
    window.history.replaceState({}, '', novaUrl)
    window.location.reload()
  }

  return (
    <aside className="playground-panel" aria-label="Playground de clima">
      <div className="playground-panel__header">
        <span className="playground-panel__badge">DEV</span>
        <h2>Playground</h2>
      </div>

      <p>Teste rapidamente o visual em diferentes condições climáticas.</p>

      <div className="playground-controls">
        {CONDICOES.map(item => (
          <button
            key={item.key}
            type="button"
            className={`playground-button${current === item.key ? ' is-active' : ''}`}
            onClick={() => aplicarCondicao(item.key)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="playground-status">
        <span>Modo atual</span>
        <strong>{CONDICOES.find(item => item.key === current)?.label ?? 'Ensolarado'}</strong>
      </div>
    </aside>
  )
}
