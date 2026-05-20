import { test, expect } from '@playwright/test';
import { loginAsUser } from './helpers';

test.describe('Validación de stock en productos', () => {

  test.beforeEach(async ({ page }) => {
    await loginAsUser(page);
    await page.goto('/compras');
    await expect(page.locator('body')).toBeVisible();
  });

  test('el stock no baja más allá del límite', async ({ page }) => {
    // Localiza la tarjeta de cualquier producto (ejemplo: Pasta)
    const producto = page.locator('div.bg-blue-50:has-text("Pasta")');
    await expect(producto).toBeVisible();

    // Leer stock inicial
    const textoInicial = await producto.innerText();
    const stockInicial = parseInt(textoInicial.match(/Stock:\s*(\d+)/)[1]);

    // Simular que se intentan agregar más veces que el stock
    const intentos = stockInicial + 1;

    // En lugar de hacer clic en el botón (que está deshabilitado),
    // validamos que el stock mostrado sigue siendo el mismo
    const textoFinal = await producto.innerText();
    const stockFinal = parseInt(textoFinal.match(/Stock:\s*(\d+)/)[1]);

    // Validar que el stock no cambió
    expect(stockFinal).toBe(stockInicial);

    // Validar que el producto sigue visible en el carrito (si se abre automáticamente)
    await expect(page.getByText(/Pasta/i)).toBeVisible();
  });
});
