import { test, expect } from '@playwright/test';
import { loginAsUser } from './helpers';

test.describe('Reportes de Ventas', () => {

  test.beforeEach(async ({ page }) => {
    await loginAsUser(page);
    await page.goto('/reportes-ventas');
    await page.waitForSelector('h2:has-text("Reportes de Ventas")');
  });

  test('debería cargar la página de reportes correctamente', async ({ page }) => {
    await expect(page.locator('h2:has-text("Reportes de Ventas")')).toBeVisible();
    await expect(page.locator('button:has-text("Descargar PDF del reporte")')).toBeVisible();
    await expect(page.locator('input[placeholder="Nombre del producto..."]')).toBeVisible();
    await expect(page.locator('h3:has-text("Ventas registradas")')).toBeVisible();
    await expect(page.locator('h3:has-text("Análisis de ventas por producto")')).toBeVisible();
  });

  test('debería tener filtros de fecha disponibles', async ({ page }) => {
    await expect(page.locator('input[placeholder="ID de venta..."]')).toBeVisible();
    const dateInputs = page.locator('input[type="date"]');
    const count = await dateInputs.count();
    expect(count).toBeGreaterThanOrEqual(2);
  });

  test('debería mostrar tabla de ventas con datos si existen', async ({ page }) => {
    await page.waitForTimeout(4000);
    const hasVentas = await page.locator('table tbody tr:not(:has-text("No hay ventas"))').count();
    if (hasVentas > 0) {
      const ventasTable = page.locator('h3:has-text("Ventas registradas")').locator('..').locator('table');
      await expect(ventasTable.locator('thead th').nth(0)).toBeVisible();
    } else {
      await expect(page.locator('text=No hay ventas para este filtro')).toBeVisible();
    }
  });

  test('debería tener el botón de descarga PDF', async ({ page }) => {
    const pdfBtn = page.locator('button:has-text("Descargar PDF del reporte")');
    await expect(pdfBtn).toBeVisible();
    await expect(pdfBtn).toBeEnabled();
  });

  test('debería mostrar análisis de ventas por producto', async ({ page }) => {
    await page.waitForTimeout(4000);
    const analisisTable = page.locator('h3:has-text("Análisis de ventas por producto")').locator('..').locator('table');
    await expect(analisisTable.locator('thead th').nth(0)).toBeVisible();
    await expect(analisisTable.locator('thead th').nth(1)).toBeVisible();
    await expect(analisisTable.locator('thead th').nth(2)).toBeVisible();
  });
});
