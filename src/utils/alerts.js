function getMaximumPrecipitationChance(hourly = {}) {
  const chanceValues = Array.isArray(hourly.precipitation_probability)
    ? hourly.precipitation_probability
    : []

  return chanceValues.reduce((highest, value) => Math.max(highest, Number(value ?? 0)), 0)
}

export function getWeatherAlerts(data = {}) {
  const alerts = []
  const current = data.current ?? {}
  const hourly = data.hourly ?? {}
  const daily = data.daily ?? {}

  const maxChance = getMaximumPrecipitationChance(hourly)
  const highestHourlyRain = Array.isArray(hourly.precipitation)
    ? hourly.precipitation.reduce((highest, value) => Math.max(highest, Number(value ?? 0)), 0)
    : 0

  if (maxChance >= 80 || highestHourlyRain >= 3) {
    alerts.push({
      key: 'rain',
      severity: 'alerta',
      title: 'Chuva intensa nas próximas horas',
      description: 'Há alta chance de precipitação forte e intensa no período mais próximo.',
      icon: '🌧️',
    })
  } else if (maxChance >= 55) {
    alerts.push({
      key: 'rain',
      severity: 'atenção',
      title: 'Possível chuva forte',
      description: 'A probabilidade de chuva aumenta nos próximos horários.',
      icon: '🌦️',
    })
  }

  if ([95, 96, 99].includes(Number(current.weather_code ?? 0))) {
    alerts.push({
      key: 'storm',
      severity: 'alerta',
      title: 'Tempestade possível',
      description: 'Há condições favoráveis a descargas elétricas e rajadas intensas.',
      icon: '⛈️',
    })
  }

  const windSpeed = Number(current.wind_speed_10m ?? 0)
  const windGust = Number(current.wind_gusts_10m ?? 0)
  if (windSpeed >= 40 || windGust >= 50) {
    alerts.push({
      key: 'wind',
      severity: 'atenção',
      title: 'Vento forte',
      description: 'Rajadas e deslocamento do ar podem aumentar no período mais próximo.',
      icon: '💨',
    })
  }

  const temperature = Number(current.temperature_2m ?? 0)
  const uvIndex = Number(current.uv_index ?? daily?.uv_index_max?.[0] ?? 0)

  if (temperature >= 32) {
    alerts.push({
      key: 'heat',
      severity: 'alerta',
      title: 'Calor extremo',
      description: 'Temperaturas elevadas podem gerar desconforto e atenção à hidratação.',
      icon: '☀️',
    })
  }

  if (temperature <= 5) {
    alerts.push({
      key: 'cold',
      severity: 'atenção',
      title: 'Frio intenso',
      description: 'Temperaturas baixas podem demandar proteção extra para o exterior.',
      icon: '❄️',
    })
  }

  if (uvIndex >= 7) {
    alerts.push({
      key: 'uv',
      severity: 'atenção',
      title: 'UV alto',
      description: 'A radiação ultravioleta está elevada em comparação com o normal.',
      icon: '🛡️',
    })
  }

  return alerts
}
