export function LocationTransition() {
  return (
    <div
      className="transicao-localizacao"
      role="status"
      aria-live="polite"
      aria-label="Localizando o dispositivo"
    >
      <div className="transicao-localizacao__cena">
        <span className="transicao-localizacao__pulso transicao-localizacao__pulso--one" />
        <span className="transicao-localizacao__pulso transicao-localizacao__pulso--two" />
        <span className="transicao-localizacao__pino" aria-hidden="true">
          ⌖
        </span>
        <span className="transicao-localizacao__linha" aria-hidden="true" />
        <span className="transicao-localizacao__orbita" aria-hidden="true">
          <span className="transicao-localizacao__orbita-ponto" />
        </span>
      </div>
      <p>Localizando seu clima...</p>
    </div>
  )
}
