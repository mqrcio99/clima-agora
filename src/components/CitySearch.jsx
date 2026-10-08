import { useState } from 'react'

export function CitySearch({ onSearch, disabled = false }) {
  const [city, setCity] = useState('')

  const submit = (event) => {
    event.preventDefault()
    const query = city.trim()
    if (query && !disabled) {
      onSearch(query)
    }
  }

  return (
    <form className="city-search" onSubmit={submit}>
      <label htmlFor="city-search">Buscar cidade</label>
      <div className="city-search__row">
        <input
          id="city-search"
          value={city}
          onChange={(event) => setCity(event.target.value)}
          placeholder="Ex.: São Paulo"
          autoComplete="address-level2"
          disabled={disabled}
        />
        <button type="submit" disabled={disabled || !city.trim()}>
          Buscar
        </button>
      </div>
    </form>
  )
}
