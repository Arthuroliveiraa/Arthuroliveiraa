import { test, expect } from '@playwright/test';

async function ready(page, path) {
  await page.goto(path);
  await page.evaluate(async () => {
    document.querySelectorAll('img[loading="lazy"]').forEach(image => { image.loading = 'eager'; });
    await document.fonts.ready;
    await Promise.all([...document.images].filter(image => image.getAttribute('src')).map(image => image.decode()));
  });
}

for (const width of [1440, 390]) for (const theme of ['light', 'dark']) {
  test(`referências ${width}px ${theme}`, async ({ page }) => {
    await page.clock.setFixedTime(new Date('2026-11-06T12:00:00-03:00'));
    await page.setViewportSize({ width, height: 1000 });
    await page.emulateMedia({ colorScheme: theme });
    const name = section => `${section}-${width}-${theme}.png`;
    // A captura de um componente inteiro não deve incluir barras fixas de outra área.
    const component = { style: '.header-nav, .ds-topbar, .skip-link { visibility: hidden !important; }' };
    await ready(page, '/');
    await expect(page).toHaveScreenshot(name('inicio'));
    await page.locator('.treatment-details summary').first().click();
    await expect(page.locator('#tratamentos')).toHaveScreenshot(name('tratamentos'), component);
    await expect(page.locator('#espaco')).toHaveScreenshot(name('galeria'), component);
    await page.locator('#schedule-demo > summary').click();
    await expect(page.locator('#agendamento')).toHaveScreenshot(name('formulario'), component);
    await ready(page, '/design-system.html');
    await expect(page).toHaveScreenshot(name('guia-inicio'));
    await expect(page.locator('#componentes')).toHaveScreenshot(name('guia-componentes'), component);
    await ready(page, '/Arthuroliveiraa/pagina-inexistente');
    await expect(page).toHaveScreenshot(name('erro-404'));
  });
}
