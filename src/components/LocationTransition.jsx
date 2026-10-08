export function LocationTransition() {
  return (
    <div className="location-transition" role="status" aria-live="polite" aria-label="Localizando o dispositivo">
      <div className="location-transition__scene">
        <span className="location-transition__pulse location-transition__pulse--one" />
        <span className="location-transition__pulse location-transition__pulse--two" />
        <span className="location-transition__pin" aria-hidden="true">⌖</span>
        <span className="location-transition__line" aria-hidden="true" />
        <span className="location-transition__orbit" aria-hidden="true">
          <span className="location-transition__orb" />
        </span>
      </div>
      <p>Localizando seu clima...</p>
    </div>
  )
}
