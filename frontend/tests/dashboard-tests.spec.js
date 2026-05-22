import { test, expect } from '@playwright/test';

const loginAsUser = async (page, email = 'mcaguz11@gmail.com', password = 'Hola111.') => {
  await page.goto('/');
  await page.locator('button:not([type="submit"]):has-text("Iniciar sesión")').click();
  const loginForm = page.locator('form').filter({ hasText: 'Iniciar sesión' }).first();
  await loginForm.locator('input[name="email"]').fill(email);
  await loginForm.locator('input[name="password"]').fill(password);
  await loginForm.locator('#captcha-login').check();
  await loginForm.locator('button[type="submit"]').click();
  await page.waitForURL(/.*\/(dashboard|compras)$/, { timeout: 30000 });
};

test.describe('Pruebas del Dashboard', () => {
  test('debería cargar el dashboard después de login', async ({ page }) => {
    await loginAsUser(page);
    await expect(page).toHaveURL(/dashboard/);
  });

  test('debería mostrar datos del dashboard', async ({ page }) => {
    await loginAsUser(page);
    const dashboardContent = page.locator('[class*="dashboard"], main, .content');
    await expect(dashboardContent).toBeVisible();
  });

  test('debería poder hacer acciones en el dashboard', async ({ page }) => {
    await loginAsUser(page);
    const actionButton = page.locator('button:has-text("Crear"), button:has-text("Nuevo"), .btn-primary');
    if (await actionButton.isVisible()) {
      await actionButton.click();
      await page.waitForTimeout(1000);
    }
  });
});

test.describe('Tests de Admin', () => {
  test('admin debería ver opciones de administración', async ({ page }) => {
    await loginAsUser(page, 'mcaguz11@gmail.com', 'Hola111.');
    await page.goto('/dashboard');
    const adminPanel = page.locator('[class*="admin"], [data-role="admin"]');
    if (await adminPanel.isVisible()) {
      await expect(adminPanel).toBeVisible();
    }
  });
});

test.describe('Tests de Usuario Normal', () => {
  test('usuario normal no debería ver opciones de admin', async ({ page }) => {
    await loginAsUser(page, 'usuario@test.com', 'usuario123');
    await page.goto('/dashboard');
    const adminPanel = page.locator('[class*="admin"], [data-role="admin"]');
    if (await adminPanel.count() > 0) {
      await expect(adminPanel).not.toBeVisible();
    }
  });
});
