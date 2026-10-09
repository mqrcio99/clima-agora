import { expect, test } from '@playwright/test'

const VIEWPORTS = [
  { name: 'celular compacto', width: 320, height: 720 },
  { name: 'celular', width: 390, height: 844 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1366, height: 768 },
  { name: 'TV', width: 1920, height: 1080 },
]

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

for (const viewport of VIEWPORTS) {
  test(`layout sem rolagem horizontal em ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height })
    await negarGeolocalizacao(page)
    await page.goto('/')
    await expect(page.locator('.app-clima')).toBeVisible()

    const medidas = await page.evaluate(() => ({
      larguraDocumento: document.documentElement.scrollWidth,
      larguraViewport: window.innerWidth,
    }))

    expect(medidas.larguraDocumento).toBeLessThanOrEqual(medidas.larguraViewport)
  })
}

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