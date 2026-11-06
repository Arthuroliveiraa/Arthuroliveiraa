import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// A escuta em um leitor de tela real é uma verificação manual complementar.
for (const path of ['/', '/design-system.html']) {
  for (const theme of ['light', 'dark']) {
    test(`acessibilidade automática ${path} ${theme}`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: theme });
      await page.goto(path);
      await page.evaluate(() => document.fonts.ready);
      if (path === '/') {
        await page.locator('#name').fill('Pessoa de teste');
        await page.locator('#prepare').click();
        await expect(page.getByRole('link', { name: /Enviar pelo WhatsApp/ })).toBeVisible();
      }
      const scan = await new AxeBuilder({ page }).analyze();
      expect(scan.violations.map(item => ({ id: item.id, nodes: item.nodes.map(node => node.target) }))).toEqual([]);
    });
  }
}

test('teclado, estrutura acessível e ampliação de texto', async ({ page, isMobile, browserName }) => {
  await page.goto('/');
  // A política padrão do WebKit neste runtime não inclui links no Tab.
  // Nele validamos ativação e destino; a ordem com Safari fica na rodada manual.
  if (browserName === 'webkit') await page.locator('.skip-link').focus();
  else await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Pular para o conteúdo' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('main')).toBeFocused();
  if (!isMobile) {
    await page.locator('[data-gallery]').first().focus();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('dialog')).toBeVisible();
    for (let step = 0; step < 3; step++) {
      await page.keyboard.press('Tab');
      // O ciclo nativo pode passar pela interface do navegador (body ativo),
      // mas nunca deve alcançar outro controle da página sob o modal.
      expect(await page.evaluate(() => document.activeElement === document.body
        || Boolean(document.activeElement.closest('dialog')))).toBe(true);
    }
    await page.keyboard.press('Escape');
    await expect(page.locator('[data-gallery]').first()).toBeFocused();
  }
  const tree = await page.locator('main').ariaSnapshot();
  expect(tree).toContain('heading "Seu sorriso merece');
  expect(tree).toContain('textbox "Como podemos chamar você?"');
  // Texto a 200% e largura de reflow (320 CSS px), sem desabilitar zoom no viewport.
  await page.addStyleTag({ content: 'html { font-size: 200% !important; }' });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.locator('#name').fill('Pessoa de teste');
  await page.locator('#prepare').click();
  await expect(page.locator('#message')).toBeFocused();
  await expect(page.locator('#message')).toHaveValue(/Pessoa de teste/);
  await expect(page.getByRole('link', { name: /Enviar pelo WhatsApp/ })).toBeVisible();
  expect(await page.locator('meta[name="viewport"]').getAttribute('content')).not.toMatch(/user-scalable=no|maximum-scale=1/);
});
