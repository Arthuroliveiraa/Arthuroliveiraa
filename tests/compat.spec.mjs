import { test, expect } from '@playwright/test';

async function ready(page, path = '/') {
  await page.goto(path);
  await page.evaluate(() => document.fonts.ready);
}

for (const theme of ['light', 'dark']) {
  test(`fluxo completo em tema ${theme}`, async ({ page, isMobile }) => {
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('response', response => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
    await page.emulateMedia({ colorScheme: theme });
    await ready(page);
    await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
    expect(await page.locator('.hero-artwork').evaluate(image => image.naturalWidth)).toBeGreaterThan(0);
    const activate = locator => isMobile ? locator.tap() : locator.click();

    if (isMobile) {
      await activate(page.getByRole('button', { name: 'Abrir menu' }));
      await expect(page.locator('#menu')).toBeVisible();
      await activate(page.locator('#menu a[href="#tratamentos"]'));
      await expect(page.getByRole('button', { name: 'Abrir menu' })).toHaveAttribute('aria-expanded', 'false');
    }
    await activate(page.getByRole('button', { name: 'Estética', exact: true }));
    await expect(page.locator('[data-category]:visible')).toHaveCount(2);
    await activate(page.locator('[data-treatment="Ortodontia"]'));
    await expect(page.locator('#treatment')).toHaveValue('Ortodontia');
    await page.locator('#name').fill('Pessoa de teste');
    await activate(page.locator('#schedule-demo > summary'));
    await page.locator('#demo-date').fill('2099-11-20');
    await activate(page.getByRole('button', { name: '11:00', exact: true }));
    await activate(page.getByRole('button', { name: 'Preparar solicitação' }));
    await expect(page.locator('#message')).toHaveValue(/SIMULAÇÃO, SEM RESERVA/);
    await expect(page.locator('#send-message')).toBeHidden();
    await activate(page.getByRole('button', { name: 'Limpar dados' }));
    await expect(page.locator('#request-result')).toBeHidden();
    await expect(page.locator('#name')).toHaveValue('');

    const image = page.locator('[data-gallery]').first();
    await activate(image);
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.locator('#gallery-dialog-image')).toHaveJSProperty('complete', true);
    if (isMobile) await activate(page.getByRole('button', { name: /Fechar/ }));
    else await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toBeHidden();
    await expect(image).toBeFocused();

    await activate(page.getByRole('button', { name: 'Modo escuro' }));
    const other = theme === 'light' ? 'dark' : 'light';
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-theme', other);
    if (!isMobile) {
      for (const width of [320, 768, 1024, 1440]) {
        await page.setViewportSize({ width, height: 900 });
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      }
    } else expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(errors).toEqual([]);
  });
}

test('guia visual acompanha os dois temas', async ({ page }) => {
  await ready(page, '/design-system.html');
  for (const theme of ['light', 'dark']) {
    await page.emulateMedia({ colorScheme: theme });
    await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
    await expect(page.locator('[data-contrast-pass="true"]')).toHaveCount(6);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
});

test('conteúdo e navegação disponíveis sem JavaScript', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const page = await context.newPage();
    await page.goto(baseURL);
    await expect(page.locator('#menu')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Modo escuro' })).toBeHidden();
    await expect(page.locator('#prepare')).toBeDisabled();
    await expect(page.locator('[data-category]:visible')).toHaveCount(4);
    await page.locator('.treatment-details summary').first().click();
    await expect(page.locator('.treatment-expanded').first()).toBeVisible();
    expect(await page.locator('[data-gallery]').first().getAttribute('href')).toMatch(/^assets\//);
  } finally { await context.close(); }
});
