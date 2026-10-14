import { expect, test } from '@playwright/test'

const VIEWPORTS = [
  { name: 'celular compacto', width: 320, height: 720 },
  { name: 'celular', width: 390, height: 844 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'tablet grande', width: 1024, height: 900 },
  { name: 'desktop compacto', width: 1280, height: 800 },
  { name: 'desktop', width: 1366, height: 768 },
  { name: 'desktop amplo', width: 1440, height: 900 },
  { name: 'desktop 1900', width: 1900, height: 1000 },
  { name: 'TV', width: 1920, height: 1080 },
]

const CONDITIONS = ['clear', 'rain', 'cloudy', 'storm', 'cold', 'snow', 'night']

async function negarGeolocalizacao(page) {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'geolocation', {
      configurable: true,
      value: {
        getCurrentPosition(_success, error) {
          error({ code: 1, PERMISSION_DENIED: 1 })
        },
      },
    })
  })
}

async function simularPrevisao(page) {
  await page.route('**/v1/search?**', route =>
    route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({ results: [{ name: 'Lisboa', latitude: 38.72, longitude: -9.14 }] }),
    }),
  )
  await page.route('**/v1/forecast?**', route =>
    route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        current: {
          temperature_2m: 20,
          apparent_temperature: 20,
          relative_humidity_2m: 60,
          wind_speed_10m: 10,
          weather_code: 3,
          is_day: 1,
        },
        daily: {
          time: ['2026-10-13', '2026-10-14', '2026-10-15', '2026-10-16', '2026-10-17'],
          temperature_2m_max: [22, 23, 21, 20, 22],
          temperature_2m_min: [15, 16, 14, 13, 15],
          weather_code: [3, 1, 2, 61, 3],
        },
      }),
    }),
  )
}

async function carregarPrevisao(page) {
  await page.goto('/?debug=cloudy')
  const campo = page.getByRole('textbox', { name: 'Digite o nome de uma cidade' })
  await campo.fill('Lisboa')
  await page.getByRole('button', { name: 'Buscar clima da cidade' }).click()
  await expect(page.getByRole('heading', { name: 'Lisboa' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Próximos 5 dias' })).toBeVisible()
}

for (const viewport of VIEWPORTS) {
  test(`layout sem rolagem horizontal em ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height })
    await negarGeolocalizacao(page)
    await simularPrevisao(page)
    await carregarPrevisao(page)
    await expect(page.locator('.app-clima')).toBeVisible()

    const medidas = await page.evaluate(() => {
      const rect = selector => {
        const { x, y, width, height } = document.querySelector(selector).getBoundingClientRect()
        return { x, y, width, height }
      }
      return {
        larguraDocumento: document.documentElement.scrollWidth,
        larguraViewport: window.innerWidth,
        conteudo: rect('.conteudo-clima'),
        cabecalho: rect('.cabecalho'),
        cartao: rect('.cartao-clima'),
        previsao: rect('.previsao'),
      }
    })

    expect(medidas.larguraDocumento).toBeLessThanOrEqual(medidas.larguraViewport)
    expect(Math.abs(medidas.cartao.x - medidas.previsao.x)).toBeLessThanOrEqual(1)
    expect(Math.abs(medidas.cartao.width - medidas.previsao.width)).toBeLessThanOrEqual(1)
    expect(Math.abs(medidas.cabecalho.width - medidas.conteudo.width)).toBeLessThanOrEqual(1)
    expect(medidas.cabecalho.y + medidas.cabecalho.height).toBeLessThanOrEqual(medidas.cartao.y + 1)
    expect(medidas.cartao.y + medidas.cartao.height).toBeLessThanOrEqual(medidas.previsao.y + 1)
  })
}

test('contraste AA em todos os temas na TV', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 })
  await negarGeolocalizacao(page)

  for (const condition of CONDITIONS) {
    await page.goto(`/?playground&debug=${condition}`)
    await expect(page.locator('.app-clima')).toHaveAttribute('data-theme', condition)

    const contrast = await page.evaluate(() => {
      const root = document.querySelector('.app-clima')
      const card = document.querySelector('.cartao-clima')
      const input = document.querySelector('.busca-cidade input')
      const button = document.querySelector('.busca-cidade button')
      const readColor = value => {
        const rgb = value.match(/rgba?\(([^)]+)\)/)
        if (rgb) {
          return rgb[1].split(',').slice(0, 3).map(Number)
        }
        const hex = value.trim().slice(1)
        const normalized =
          hex.length === 3 ? [...hex].map(channel => channel.repeat(2)).join('') : hex
        return [0, 2, 4].map(index => Number.parseInt(normalized.slice(index, index + 2), 16))
      }
      const luminance = color => {
        const [red, green, blue] = color.map(value => {
          const channel = value / 255
          return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
        })
        return 0.2126 * red + 0.7152 * green + 0.0722 * blue
      }
      const ratio = (foreground, background) => {
        const first = luminance(foreground)
        const second = luminance(background)
        return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05)
      }
      const rootStyle = getComputedStyle(root)
      const cardStyle = getComputedStyle(card)
      const inputStyle = getComputedStyle(input)
      const buttonStyle = getComputedStyle(button)
      const cardColor = readColor(cardStyle.backgroundColor)
      const textColor = readColor(rootStyle.getPropertyValue('--text'))
      const mutedColor = readColor(rootStyle.getPropertyValue('--muted'))
      return {
        textOnCard: ratio(textColor, cardColor),
        mutedOnCard: ratio(mutedColor, cardColor),
        inputTextOnCard: ratio(readColor(inputStyle.color), cardColor),
        placeholderOnCard: ratio(
          readColor(getComputedStyle(input, '::placeholder').color),
          cardColor,
        ),
        buttonTextOnButton: ratio(
          readColor(buttonStyle.color),
          readColor(buttonStyle.backgroundColor),
        ),
      }
    })

    for (const [text, ratio] of Object.entries(contrast)) {
      expect(ratio, `${condition}: ${text}`).toBeGreaterThanOrEqual(4.5)
    }
  }
})

test('só pesquisa a cidade depois de clicar em Buscar', async ({ page }) => {
  let chamadasGeocodificacao = 0
  await negarGeolocalizacao(page)
  await page.route('**/geocoding-api.open-meteo.com/**', async route => {
    chamadasGeocodificacao += 1
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({ results: [] }),
    })
  })
  await page.goto('/')

  const campo = page.getByRole('textbox', { name: 'Digite o nome de uma cidade' })
  const botaoBuscar = page.getByRole('button', { name: 'Buscar clima da cidade' })
  await expect(botaoBuscar).toBeEnabled()
  await campo.fill('São Paulo')
  expect(chamadasGeocodificacao).toBe(0)

  await botaoBuscar.click()
  await expect.poll(() => chamadasGeocodificacao).toBe(1)
})
