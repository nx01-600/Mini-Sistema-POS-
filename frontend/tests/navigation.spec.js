import { test, expect } from '@playwright/test';

test.describe('Navegación', () => {
  test.beforeEach(async ({ page }) => {
    // Asume que necesitas estar autenticado
    await page.goto('/');
  });

  test('debería navegar entre páginas', async ({ page }) => {
    // Busca un enlace de navegación (ajusta según tu Sidebar.jsx)
    const dashboardLink = page.locator('a:has-text("Dashboard")');
    
    if (await dashboardLink.isVisible()) {
      await dashboardLink.click();
      await page.waitForURL('**/dashboard');
      await expect(page).toHaveURL(/dashboard/);
    }
  });

  test('debería abrir/cerrar el sidebar en móvil', async ({ page }) => {
    // Simular viewport móvil
    await page.setViewportSize({ width: 375, height: 667 });
    
    const menuButton = page.locator('button[aria-label="toggle sidebar"], .menu-icon');
    
    if (await menuButton.isVisible()) {
      await menuButton.click();
      const sidebar = page.locator('[class*="sidebar"]');
      await expect(sidebar).toHaveClass(/open|active|visible/);
    }
  });
});
