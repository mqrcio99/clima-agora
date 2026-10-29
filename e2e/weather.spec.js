import { expect, test } from '@playwright/test'

const CITY_KEY = 'clima-agora:last-city'

test.use({ timezoneId: 'UTC' })

function createForecast({ missingValues = false, alerts = false, hourlyTimes = [] } = {}) {
  const today = new Date()
  const dates = Array.from({ length: 16 }, (_, index) => {
    const date = new Date(today)
    date.setUTCDate(date.getUTCDate() + index)
    return date.toISOString().slice(0, 10)
  })
  const current = {
    temperature_2m: alerts ? 35 : missingValues ? null : 24,
    apparent_temperature: missingValues ? null : 25,
    relative_humidity_2m: missingValues ? null : 60,
    wind_speed_10m: alerts ? 45 : missingValues ? null : 12,
    wind_gusts_10m: alerts ? 55 : null,
    weather_code: alerts ? 95 : 0,
    is_day: 1,
    uv_index: alerts ? 8 : null,
  }

  return {
    timezone: 'America/Sao_Paulo',
    current,
    hourly: {
      time: hourlyTimes,
      temperature_2m: hourlyTimes.map(() => 20),
      precipitation_probability: alerts ? [90] : [],
      precipitation: alerts ? [4] : [],
      weather_code: hourlyTimes.map(() => 0),
    },
    daily: {
      time: dates,
      temperature_2m_max: dates.map(() => (missingValues ? null : 29)),
      temperature_2m_min: dates.map(() => (missingValues ? null : 18)),
      precipitation_probability_max: dates.map(() => null),
      uv_index_max: dates.map(() => null),
      sunrise: dates.map(date => `${date}T06:00`),
      sunset: dates.map(date => `${date}T18:00`),
      weather_code: dates.map(() => 0),
    },
  }
}

async function openWeatherApp(page, forecastOptions, clockTime, condition = 'clear') {
  await page.addInitScript(({ key, city }) => localStorage.setItem(key, city), {
    key: CITY_KEY,
    city: 'São Paulo',
  })
  await page.route('https://geocoding-api.open-meteo.com/**', route =>
    route.fulfill({
      json: { results: [{ latitude: -23.55, longitude: -46.63, name: 'São Paulo' }] },
    }),
  )
  await page.route('https://api.open-meteo.com/v1/forecast**', route =>
    route.fulfill({ json: createForecast(forecastOptions) }),
  )
  if (clockTime) {
    await page.clock.install({ time: clockTime })
  }
  await page.goto(`/?debug=${condition}`)
  await expect(page.getByRole('heading', { name: 'São Paulo' })).toBeVisible()
}

test('mostra hoje e os próximos 15 dias', async ({ page }) => {
  await openWeatherApp(page)

  await expect(page.getByRole('heading', { name: 'Hoje e os próximos 15 dias' })).toBeVisible()
  await expect(page.locator('.previsao__lista').last().locator('.cartao-dia')).toHaveCount(16)
})

test('anima o fundo quando clicado conforme a condição do tempo', async ({ page }) => {
  const background = page.locator('.weather-background')

  await openWeatherApp(page, {}, undefined, 'clear')
  await expect(page.locator('.cartao-clima')).toHaveCSS('cursor', 'default')
  await expect(page.locator('.cartao-dia').first()).toHaveCSS('cursor', 'default')
  await page.locator('.cartao-clima').click({ position: { x: 10, y: 10 } })
  await expect(background).not.toHaveAttribute('data-effect', 'sun')
  await page.locator('.app-clima').click({ position: { x: 8, y: 8 } })
  await expect(background).toHaveAttribute('data-effect', 'sun')

  await openWeatherApp(page, {}, undefined, 'rain')
  await page.locator('.app-clima').click({ position: { x: 8, y: 8 } })
  await expect(background).toHaveAttribute('data-effect', 'lightning')

  await openWeatherApp(page, {}, undefined, 'snow')
  await page.locator('.app-clima').click({ position: { x: 8, y: 8 } })
  await expect(background).toHaveAttribute('data-effect', 'ice')
})

test('usa o fuso retornado pela API para selecionar a próxima hora', async ({ page }) => {
  await openWeatherApp(
    page,
    {
      hourlyTimes: ['2026-10-29T12:00', '2026-10-29T13:00', '2026-10-29T14:00', '2026-10-29T15:00'],
    },
    new Date('2026-10-29T16:30:00.000Z'),
  )

  const hourlyCards = page.locator('.previsao__lista').first().locator('.cartao-dia')
  await expect(hourlyCards).toHaveCount(2)
  await expect(hourlyCards.nth(0).locator('span').first()).toHaveText('Agora')
  await expect(hourlyCards.nth(1).locator('span').first()).toHaveText('15h')
})

test('mostra indisponibilidade sem inventar valores ou alertas', async ({ page }) => {
  await openWeatherApp(page, { missingValues: true })

  await expect(page.locator('.linha-temperatura strong').first()).toHaveText('—')
  await expect(page.getByText('Mínima').locator('..').locator('strong')).toHaveText('—')
  await expect(page.locator('.alert-banner')).toHaveCount(0)
})

test('apresenta todos os alertas ordenados por gravidade e com aviso oficial', async ({ page }) => {
  await openWeatherApp(page, { alerts: true })

  const alertRegion = page.getByRole('alert')
  await expect(alertRegion).toBeVisible()
  const alertTitles = alertRegion.locator('.alert-banner__list li strong')
  await expect(alertTitles).toHaveCount(5)
  await expect(alertTitles.first()).toHaveText('Chuva intensa nas próximas horas')
  await expect(
    page.getByText('Avisos calculados localmente e não substituem alertas oficiais.'),
  ).toBeVisible()
})
