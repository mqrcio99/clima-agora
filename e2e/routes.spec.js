import { expect, test } from '@playwright/test'

test('navega entre configurações e favoritos por rotas', async ({ page }) => {
  await page.goto('/configuracoes')

  await expect(page.getByRole('heading', { name: 'Configurações' })).toBeVisible()
  await page.getByRole('link', { name: 'Favoritos' }).click()

  await expect(page).toHaveURL(/\/favoritos$/)
  await expect(page.getByRole('heading', { name: 'Favoritos' })).toBeVisible()
})

test('mantém o fundo montado ao trocar de rota', async ({ page }) => {
  await page.goto('/configuracoes')

  await page.locator('.weather-background').waitFor()
  await page.evaluate(() => {
    window.initialWeatherBackground = document.querySelector('.weather-background')
  })
  await page.getByRole('link', { name: 'Favoritos' }).click()

  const backgroundWasPreserved = await page.evaluate(
    () => window.initialWeatherBackground === document.querySelector('.weather-background'),
  )
  expect(backgroundWasPreserved).toBe(true)
})

test('aceita acesso direto e recarga nas quatro rotas', async ({ page }) => {
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

  for (const route of [
    { path: '/', title: 'Clima' },
    { path: '/favoritos', title: 'Favoritos' },
    { path: '/conta', title: 'Conta' },
    { path: '/configuracoes', title: 'Configurações' },
  ]) {
    await page.goto(route.path)
    await expect(page.getByRole('heading', { name: route.title })).toBeVisible()
    await page.reload()
    await expect(page.getByRole('heading', { name: route.title })).toBeVisible()
  }
})
