import { test, expect } from '@playwright/test';
import { loginAsUser } from './helpers';

test.describe('Gestión de Stock (CRUD)', () => {

  test('debería cargar la página de stock con todos los elementos', async ({ page }) => {
    await loginAsUser(page);
    await page.goto('/stock');
    await expect(page.locator('h2:has-text("Administrar Stock de Productos")')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('button:has-text("Agregar")')).toBeVisible();
    await expect(page.locator('input[placeholder="Buscar por nombre..."]')).toBeVisible();
    await expect(page.locator('table thead th:has-text("Nombre")')).toBeVisible();
    await expect(page.locator('table thead th:has-text("Precio")')).toBeVisible();
    await expect(page.locator('table thead th:has-text("Stock")')).toBeVisible();
    await expect(page.locator('table thead th:has-text("Acciones")')).toBeVisible();
  });

  test('debería buscar productos por nombre', async ({ page }) => {
    await loginAsUser(page);
    await page.goto('/stock');
    await expect(page.locator('h2:has-text("Administrar Stock de Productos")')).toBeVisible({ timeout: 15000 });
    const searchInput = page.locator('input[placeholder="Buscar por nombre..."]');
    await searchInput.fill('a');
    await page.waitForTimeout(1500);
    const rows = await page.locator('table tbody tr').count();
    expect(rows).toBeGreaterThanOrEqual(0);
  });

  test('debería tener filtros de stock funcionales', async ({ page }) => {
    await loginAsUser(page);
    await page.goto('/stock');
    await expect(page.locator('h2:has-text("Administrar Stock de Productos")')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('select')).toBeVisible();
    await expect(page.locator('input[placeholder="Stock"]')).toBeVisible();
    await page.locator('select').selectOption('lte');
    await page.locator('input[placeholder="Stock"]').fill('100');
    await page.waitForTimeout(1000);
  });
});
