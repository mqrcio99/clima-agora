import { useState } from 'react'

export function CitySearch({ onSearch, disabled = false, value = '', onChange }) {
  const [internalCity, setInternalCity] = useState('')
  const controlledValue = onChange ? value : internalCity

  const updateCity = nextValue => {
    if (onChange) {
      onChange(nextValue)
      return
    }

    setInternalCity(nextValue)
  }

  const submit = event => {
    event.preventDefault()
    const query = controlledValue.trim()
    if (query && !disabled && onSearch) {
      onSearch(query)
    }
  }

  return (
    <form className="busca-cidade" onSubmit={submit} aria-label="Buscar cidade">
      <label htmlFor="busca-cidade">Buscar cidade</label>
      <div className="busca-cidade__linha">
        <input
          id="busca-cidade"
          value={controlledValue}
          onChange={event => updateCity(event.target.value)}
          placeholder="Ex.: São Paulo"
          autoComplete="address-level2"
          aria-label="Digite o nome de uma cidade"
        />
        <button
          type="submit"
          disabled={disabled || !controlledValue.trim()}
          aria-label="Buscar clima da cidade"
        >
          Buscar
        </button>
      </div>
    </form>
  )
}
