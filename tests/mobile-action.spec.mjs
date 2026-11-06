import { test, expect } from '@playwright/test';

test('atalho cede espaço ao formulário e ao rodapé', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'Atalho exclusivo do celular.');
  await page.goto('/');
  const action = page.locator('.mobile-booking');
  await expect(action).toBeVisible();
  await action.tap();
  await expect(page.locator('#name')).toBeFocused();
  await expect(action).toBeHidden();
  await page.locator('#name').fill('Pessoa de teste');
  await page.setViewportSize({ width: 390, height: 420 });
  await expect(action).toBeHidden();
  await page.locator('#name').blur();
  await page.locator('#agendamento').scrollIntoViewIfNeeded();
  await expect(action).toBeHidden();
  await page.locator('.footer-main').scrollIntoViewIfNeeded();
  await expect(action).toBeHidden();
  await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
  await expect(action).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
