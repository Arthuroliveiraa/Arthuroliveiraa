import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

for (const theme of ['light', 'dark']) {
  test(`404 em subpastas e retorno seguro ${theme}`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: theme });
    const failures = [];
    page.on('pageerror', error => failures.push(error.message));
    page.on('response', response => {
      if (response.status() >= 400 && !response.url().endsWith('/nao-existe/subpagina')) failures.push(response.url());
    });
    const response = await page.goto('/Arthuroliveiraa/nao-existe/subpagina');
    expect(response.status()).toBe(404);
    await expect(page.getByRole('heading', { name: 'Não encontramos esta página.' })).toBeVisible();
    await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
    await page.locator('.skip-link').focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('main')).toBeFocused();
    await expect(page).toHaveURL(/nao-existe\/subpagina#conteudo$/);
    await page.getByRole('link', { name: 'Voltar ao início' }).click();
    await expect(page).toHaveURL(/\/Arthuroliveiraa\/index\.html$/);
    await expect(page.locator('#hero-title')).toBeVisible();
    expect(failures).toEqual([]);
  });
}
