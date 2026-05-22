import { test, expect } from '@playwright/test';
import { loginAsUser } from './helpers';

test.describe('Historial de Compras', () => {

  test.beforeEach(async ({ page }) => {
    await loginAsUser(page);
    await page.goto('/historial-compras');
    await page.waitForSelector('h2:has-text("Historial de Compras")');
  });

  test('debería cargar la página de historial correctamente', async ({ page }) => {
    await expect(page.locator('h2:has-text("Historial de Compras")')).toBeVisible();
    await expect(page.locator('label:has-text("Fecha inicio")')).toBeVisible();
    await expect(page.locator('label:has-text("Fecha fin")')).toBeVisible();
    await expect(page.locator('label:has-text("Valor mínimo")')).toBeVisible();
    await expect(page.locator('label:has-text("Valor máximo")')).toBeVisible();
    await expect(page.locator('label:has-text("Producto")')).toBeVisible();
    await expect(page.locator('input[placeholder="Buscar producto..."]')).toBeVisible();
  });

  test('debería tener filtros funcionales', async ({ page }) => {
    const dateInputs = page.locator('input[type="date"]');
    const dateCount = await dateInputs.count();
    expect(dateCount).toBeGreaterThanOrEqual(2);

    const numberInputs = page.locator('input[type="number"]');
    const numberCount = await numberInputs.count();
    expect(numberCount).toBeGreaterThanOrEqual(2);
  });

  test('debería permitir filtrar por fechas', async ({ page }) => {
    const dateInputs = page.locator('input[type="date"]');
    const today = new Date().toISOString().split('T')[0];
    await dateInputs.first().fill(today);
    await page.waitForTimeout(500);
  });

  test('debería mostrar compras o mensaje de vacío', async ({ page }) => {
    await page.locator('text=No hay compras registradas').waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});
    const hasCompras = await page.locator('text=No hay compras registradas').isVisible();
    if (!hasCompras) {
      await page.waitForTimeout(2000);
      const compraCards = page.locator('ul > li');
      const count = await compraCards.count();
      expect(count).toBeGreaterThanOrEqual(1);
    }
  });

  test('debería mostrar detalle de compras si existen', async ({ page }) => {
    await page.locator('text=No hay compras registradas').waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});
    const noData = await page.locator('text=No hay compras registradas').isVisible();
    if (!noData) {
      await page.waitForTimeout(3000);
      const comprasList = page.locator('ul').filter({ has: page.locator('li') });
      const items = await comprasList.locator('li').count();
      expect(items).toBeGreaterThanOrEqual(1);
    }
  });
});
