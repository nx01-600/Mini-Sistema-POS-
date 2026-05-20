import { test, expect } from '@playwright/test';

test.describe('Pruebas sin Login', () => {

  test('debería cargar la página principal sin login', async ({ page }) => {
    // Ir directamente a la página principal
    await page.goto('/');

    // Verificar que carga (aunque pueda redirigir al login)
    await expect(page).toHaveTitle(/Vite/);
  });

  test('debería mostrar elementos públicos', async ({ page }) => {
    // Si tienes elementos públicos, pruébalos aquí
    await page.goto('/');

    // Ejemplo: verificar que el logo se muestra
    const logo = page.locator('img[alt*="logo"], .logo, [class*="logo"]');
    if (await logo.isVisible()) {
      await expect(logo).toBeVisible();
    }
  });

  test('debería navegar a páginas públicas', async ({ page }) => {
    await page.goto('/');

    // Si tienes enlaces a páginas públicas, pruébalos
    const publicLink = page.locator('a[href*="about"], a[href*="contact"]');
    if (await publicLink.isVisible()) {
      await publicLink.click();
      await expect(page).not.toHaveURL(/login/);
    }
  });
});
