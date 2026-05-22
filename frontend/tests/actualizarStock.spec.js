import { test, expect } from '@playwright/test';
import { loginAsUser } from './helpers';

test.describe('Flujo de compra con stock', () => {

  test.beforeEach(async ({ page }) => {
    await loginAsUser(page);
    await page.goto('/compras');
    await expect(page.locator('body')).toBeVisible();
  });

  test('debería descontar stock del producto comprado', async ({ page }) => {
    const cantidad = 2;

    // Selecciona el primer producto
    const producto = page.locator('div.bg-blue-50').first();

    // Stock inicial ANTES de cualquier acción
    const textoInicial = await producto.innerText();
    const stockInicial = parseInt(textoInicial.match(/Stock:\s*(\d+)/)[1]);

    // Agregar al carrito
    await producto.getByText('Agregar al carrito').click();

    // Modificar cantidad en el input del carrito
    const inputCantidad = page.locator('input[type="number"]:not([placeholder])').first();
    await inputCantidad.fill(cantidad.toString());

    // Realizar compra
    await page.getByText(/Realizar compra/i).click();

    // Confirmar pago
    await page.getByText(/Confirmar Pago/i).click();

    // Esperar mensaje de éxito (sincroniza con el final del flujo)
    await expect(page.getByText('¡Compra realizada con éxito!')).toBeVisible({
      timeout: 15000
    });

    // Esperar a que el stock cambie al valor esperado
    const stockLocator = producto.locator('text=Stock:');
    await expect(stockLocator).toHaveText(`Stock: ${stockInicial - cantidad}`, {
      timeout: 25000
    });

    // Validación final
    const textoFinal = await producto.innerText();
    const stockFinal = parseInt(textoFinal.match(/Stock:\s*(\d+)/)[1]);
    expect(stockFinal).toBe(stockInicial - cantidad);
  });
});
