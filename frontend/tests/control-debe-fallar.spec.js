import { test, expect } from '@playwright/test';
import { loginAsUser } from './helpers';

/**
 * PRUEBA DE CONTROL — DISEÑADA PARA FALLAR A PROPOSITO
 *
 * Objetivo: demostrar que el framework de pruebas realmente esta validando
 * la regla de negocio y no esta dando falsos positivos.
 *
 * Hipotesis a refutar: el campo de cantidad del carrito acepta el valor 0.
 *
 * Si esta prueba PASARA, significaria que la regla "cantidad >= 1" no esta
 * implementada en el sistema, lo cual seria un bug. Como la regla SI esta
 * implementada (HTML min=1 + validacion JS), el sistema corrige el valor a 1
 * y la asercion `cantidad === 0` falla, confirmando que la regla funciona.
 *
 * Resultado esperado: FAIL (es lo que confirma que las demas pruebas valen).
 */
test.describe('Prueba de control (debe fallar)', () => {

  test.beforeEach(async ({ page }) => {
    await loginAsUser(page);
    await page.goto('/compras');
    await expect(page.locator('body')).toBeVisible();
  });

  test('la cantidad en el carrito deberia poder ser 0 (asercion invertida a proposito)', async ({ page }) => {
    const producto = page.locator('div.bg-blue-50').first();
    await expect(producto).toBeVisible();
    await producto.getByText('Agregar al carrito').click();

    const cantidadInput = page.locator('input[type="number"]').first();
    await expect(cantidadInput).toBeVisible();

    await cantidadInput.fill('0');

    const valorFinal = await cantidadInput.inputValue();

    // Asercion intencionalmente incorrecta: afirmamos que el campo acepto 0.
    // Como el sistema lo corrige a 1, esta asercion falla y la prueba se reporta
    // en rojo. Eso es justamente lo que queremos demostrar.
    expect(parseInt(valorFinal)).toBe(0);
  });
});
