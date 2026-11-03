import { expect, test } from '@playwright/test'

test('navega entre configurações e favoritos por rotas', async ({ page }) => {
  await page.goto('/configuracoes')

  await expect(page.getByRole('heading', { name: 'Configurações' })).toBeVisible()
  await page.getByRole('link', { name: 'Favoritos' }).click()

  await expect(page).toHaveURL(/\/favoritos$/)
  await expect(page.getByRole('heading', { name: 'Favoritos' })).toBeVisible()
})
