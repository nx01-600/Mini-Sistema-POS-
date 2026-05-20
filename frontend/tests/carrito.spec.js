import { test, expect } from '@playwright/test';
import { loginAsUser } from './helpers';

test.describe('Validación de cantidad mínima en carrito', () => {

  test.beforeEach(async ({ page }) => {
    await loginAsUser(page);
    await page.goto('/compras');
    await expect(page.locator('body')).toBeVisible();
  });

  test('la cantidad en el carrito nunca debe ser menor a 1', async ({ page }) => {
    // Seleccionar un producto cualquiera y agregarlo al carrito
    const producto = page.locator('div.bg-blue-50').first();
    await expect(producto).toBeVisible();
    await producto.getByText('Agregar al carrito').click();

    // Localizar el campo de cantidad dentro del carrito
    const cantidadInput = page.locator('input[type="number"]').first();
    await expect(cantidadInput).toBeVisible();

    // Intentar poner 0 manualmente
    await cantidadInput.fill('0');

    // Validar que el sistema corrige automáticamente a 1
    const valorFinal = await cantidadInput.inputValue();
    expect(parseInt(valorFinal)).toBeGreaterThanOrEqual(1);
  });
});
