import { test, expect } from '@playwright/test';

test.describe('Página Principal', () => {
  test('debería cargar la página correctamente', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Vite/);
  });

  test('debería existir el contenedor root', async ({ page }) => {
    await page.goto('/');
    const root = await page.locator('#root');
    await expect(root).toBeVisible();
  });
});
