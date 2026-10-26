import { expect, test } from '@playwright/test'

const VIEWPORTS = [
  { name: 'celular compacto', width: 320, height: 720 },
  { name: 'celular pequeno', width: 360, height: 800 },
  { name: 'celular', width: 390, height: 844 },
  { name: 'celular amplo', width: 430, height: 900 },
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
  const forecastDates = Array.from({ length: 16 }, (_, index) => {
    const date = new Date(Date.UTC(2026, 9, 13 + index))
    return date.toISOString().slice(0, 10)
  })

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
          time: forecastDates,
          temperature_2m_max: Array.from({ length: 16 }, (_, index) => 22 + index),
          temperature_2m_min: Array.from({ length: 16 }, (_, index) => 15 + index),
          precipitation_probability_max: [25, 75, 25, 80, ...Array(12).fill(20)],
          weather_code: [3, 1, 2, 61, ...Array(12).fill(3)],
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

    if (viewport.width < 640) {
      await page.getByRole('button', { name: 'Abrir menu' }).click()
    }

    const medidas = await page.evaluate(() => {
      const rect = selector => {
        const { x, y, width, height } = document.querySelector(selector).getBoundingClientRect()
        return { x, y, width, height }
      }
      return {
        larguraDocumento: document.documentElement.scrollWidth,
        larguraViewport: window.innerWidth,
        resumosCortados: [...document.querySelectorAll('.cabecalho__resumo')]
          .filter(element => getComputedStyle(element).display !== 'none')
          .filter(element => element.scrollWidth > element.clientWidth + 1)
          .map(element => element.innerText),
        conteudo: rect('.conteudo-clima'),
        cabecalho: rect('.cabecalho'),
        cartao: rect('.cartao-clima'),
        previsao: rect('.previsao'),
      }
    })

    expect(medidas.larguraDocumento).toBeLessThanOrEqual(medidas.larguraViewport)
    expect(medidas.resumosCortados).toEqual([])
    expect(Math.abs(medidas.cabecalho.width - medidas.conteudo.width)).toBeLessThanOrEqual(1)
    expect(medidas.cartao.x).toBeGreaterThanOrEqual(medidas.conteudo.x)
    expect(medidas.cartao.x + medidas.cartao.width).toBeLessThanOrEqual(
      medidas.conteudo.x + medidas.conteudo.width,
    )
    expect(medidas.previsao.x).toBeGreaterThanOrEqual(medidas.conteudo.x)
    expect(medidas.previsao.x + medidas.previsao.width).toBeLessThanOrEqual(
      medidas.conteudo.x + medidas.conteudo.width,
    )
    expect(medidas.cabecalho.y + medidas.cabecalho.height).toBeLessThanOrEqual(medidas.cartao.y + 1)
    expect(medidas.cartao.y + medidas.cartao.height).toBeLessThanOrEqual(medidas.previsao.y + 1)
  })
}

test('menu mobile abre, fecha com Esc e clique fora, e mantém resumos compactos', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await negarGeolocalizacao(page)
  await simularPrevisao(page)
  await carregarPrevisao(page)

  const menu = page.getByRole('button', { name: 'Abrir menu' })
  const nav = page.getByRole('navigation', { name: 'Previsão do tempo' })
  await expect(menu).toBeVisible()
  await expect(menu).toHaveAttribute('aria-expanded', 'false')
  await expect(nav).toBeHidden()

  await menu.click()
  await expect(page.getByRole('button', { name: 'Fechar menu' })).toHaveAttribute(
    'aria-expanded',
    'true',
  )
  await expect(nav.getByRole('link')).toHaveCount(4)
  await expect(nav.getByRole('link', { name: /15 dias/ })).toContainText('2 chuvosos')
  await expect(nav.locator('.cabecalho__resumo--compacto').last()).toBeInViewport()
  await expect
    .poll(() =>
      page.evaluate(() =>
        [...document.querySelectorAll('.cabecalho__link')].every(link => {
          const { width, height } = link.getBoundingClientRect()
          return width >= 44 && height >= 44
        }),
      ),
    )
    .toBe(true)

  await page.keyboard.press('Escape')
  await expect(menu).toHaveAttribute('aria-expanded', 'false')
  await expect(menu).toBeFocused()

  await menu.click()
  await page.locator('.cartao-clima').click({ position: { x: 10, y: 10 } })
  await expect(menu).toHaveAttribute('aria-expanded', 'false')
})

test('header se reorganiza em duas linhas no tablet e uma no desktop', async ({ page }) => {
  await negarGeolocalizacao(page)
  await simularPrevisao(page)

  await page.setViewportSize({ width: 768, height: 1024 })
  await carregarPrevisao(page)
  const tabletLayout = await page.evaluate(() => {
    const brand = document.querySelector('.marca').getBoundingClientRect()
    const search = document.querySelector('.busca-cidade').getBoundingClientRect()
    const nav = document.querySelector('.cabecalho__navegacao').getBoundingClientRect()
    const links = [...document.querySelectorAll('.cabecalho__link')].map(link =>
      link.getBoundingClientRect(),
    )
    return {
      firstRow: Math.abs(brand.top - search.top) < 30,
      navigationBelow: nav.top > Math.max(brand.bottom, search.bottom),
      linksInGrid: links.every((link, index) => index === 0 || link.left > links[index - 1].left),
    }
  })
  expect(tabletLayout.firstRow).toBe(true)
  expect(tabletLayout.navigationBelow).toBe(true)
  expect(tabletLayout.linksInGrid).toBe(true)

  await page.setViewportSize({ width: 1440, height: 900 })
  const desktopLayout = await page.evaluate(() => {
    const header = document.querySelector('.cabecalho').getBoundingClientRect()
    const brand = document.querySelector('.marca').getBoundingClientRect()
    const navigation = document.querySelector('.cabecalho__navegacao-grupo').getBoundingClientRect()
    const search = document.querySelector('.busca-cidade').getBoundingClientRect()
    return {
      headerHeight: header.height,
      brandInsideHeader: brand.top >= header.top && brand.bottom <= header.bottom,
      navigationInsideHeader: navigation.top >= header.top && navigation.bottom <= header.bottom,
      searchInsideHeader: search.top >= header.top && search.bottom <= header.bottom,
    }
  })
  expect(desktopLayout.headerHeight).toBeLessThan(140)
  expect(desktopLayout.brandInsideHeader).toBe(true)
  expect(desktopLayout.navigationInsideHeader).toBe(true)
  expect(desktopLayout.searchInsideHeader).toBe(true)
})

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
      const navLink = document.querySelector('.cabecalho__link')
      const navSummary = document.querySelector('.cabecalho__resumo')
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
      const navLinkStyle = getComputedStyle(navLink)
      const navSummaryStyle = navSummary ? getComputedStyle(navSummary) : null
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
        navTextOnNav: ratio(readColor(navLinkStyle.color), readColor(navLinkStyle.backgroundColor)),
        ...(navSummary && {
          navSummaryOnNav: ratio(
            readColor(navSummaryStyle.color),
            readColor(navLinkStyle.backgroundColor),
          ),
        }),
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
  await expect(botaoBuscar).toBeDisabled()
  await campo.fill('São Paulo')
  await expect(botaoBuscar).toBeEnabled()
  expect(chamadasGeocodificacao).toBe(0)

  await botaoBuscar.click()
  await expect.poll(() => chamadasGeocodificacao).toBe(1)
})

test('exibe resumos na navegação e rola até a seção selecionada', async ({ page }) => {
  await simularPrevisao(page)
  await carregarPrevisao(page)

  const agora = page.getByRole('link', { name: /Agora/ })
  const hoje = page.getByRole('link', { name: /Hoje/ })
  const amanha = page.getByRole('link', { name: /Amanhã/ })
  const quinzeDias = page.getByRole('link', { name: /15 dias/ })

  await expect(agora).toContainText('20°')
  await expect(hoje).toContainText('15°/22°')
  await expect(hoje).toContainText('25%')
  await expect(amanha).toContainText('16°/23°')
  await expect(quinzeDias).toContainText('2 chuvosos')
  await expect(page.locator('#quinze-dias .cartao-dia')).toHaveCount(16)
  await expect(hoje).toHaveAttribute('href', '/hoje')
  await expect(amanha).toHaveAttribute('href', '/amanha')
  await expect(quinzeDias).toHaveAttribute('href', '/15-dias')
  await expect(agora).toHaveAttribute('href', '/')

  await hoje.click()
  await expect
    .poll(() =>
      page.locator('#hoje').evaluate(element => Math.abs(element.getBoundingClientRect().top)),
    )
    .toBeLessThan(20)

  const navigationHeights = await page
    .locator('.cabecalho__link')
    .evaluateAll(links => links.map(link => getComputedStyle(link).height))
  expect(new Set(navigationHeights).size).toBe(1)

  const summaryContrasts = await hoje.evaluate(link => {
    const themes = [
      'clear',
      'rain',
      'snow',
      'cloudy',
      'night',
      'storm',
      'cold',
      'heat',
      'wind',
      'uv',
    ]
    const root = link.closest('.app-clima')
    const summary = link.querySelector('.cabecalho__resumo')
    const toRgb = color =>
      color
        .match(/[\d.]+/g)
        .slice(0, 3)
        .map(Number)
    const luminance = color =>
      toRgb(color)
        .map(channel => {
          const value = channel / 255
          return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
        })
        .reduce((total, channel, index) => total + channel * [0.2126, 0.7152, 0.0722][index], 0)
    return themes.map(theme => {
      root.dataset.theme = theme
      const surfaceColor = luminance(getComputedStyle(link).backgroundColor)
      const labelColor = luminance(getComputedStyle(link.querySelector('span:first-child')).color)
      const summaryColor = luminance(getComputedStyle(summary).color)
      return {
        theme,
        label:
          (Math.max(labelColor, surfaceColor) + 0.05) / (Math.min(labelColor, surfaceColor) + 0.05),
        summary:
          (Math.max(summaryColor, surfaceColor) + 0.05) /
          (Math.min(summaryColor, surfaceColor) + 0.05),
      }
    })
  })
  for (const contrast of summaryContrasts) {
    expect(contrast.label, `${contrast.theme} label`).toBeGreaterThanOrEqual(4.5)
    expect(contrast.summary, `${contrast.theme} summary`).toBeGreaterThanOrEqual(4.5)
  }
})

test('mostra fallback após negar localização e botão Alterar foca a busca', async ({ page }) => {
  await negarGeolocalizacao(page)
  await page.goto('/')

  await expect(page.getByText('Local padrão')).toBeVisible()
  await expect(page.getByText('Permita a localização para ver dados do seu local')).toBeVisible()

  await page.getByRole('button', { name: 'Alterar' }).click()
  await expect(page.getByRole('textbox', { name: 'Digite o nome de uma cidade' })).toBeFocused()
})

test('hover destaca a navegação e respeita movimento reduzido', async ({ page }) => {
  await simularPrevisao(page)
  await carregarPrevisao(page)

  const link = page.getByRole('link', { name: /Hoje/ })
  await link.hover()
  await expect
    .poll(() => link.evaluate(element => getComputedStyle(element).transform))
    .not.toBe('none')

  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expect
    .poll(() => link.evaluate(element => getComputedStyle(element).transform))
    .toBe('none')
})
