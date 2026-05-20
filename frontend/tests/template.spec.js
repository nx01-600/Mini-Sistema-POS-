import { test, expect } from '@playwright/test';

/**
 * TEMPLATE VACÍO PARA CREAR TUS PROPIOS TESTS
 * 
 * Copia este archivo y personalízalo según tus necesidades
 * Guarda en: tests/mi-test.spec.js
 */

test.describe('Mi Suite de Pruebas', () => {
  
  test.beforeEach(async ({ page }) => {
    // Código que se ejecuta ANTES de cada test
    // Ej: ir a una página, hacer login, etc.
    await page.goto('/');
  });

  test('debería hacer algo específico', async ({ page }) => {
    // Escribe aquí tu primer test
    
    // 1. Navegar
    await page.goto('/mi-pagina');
    
    // 2. Esperar a que un elemento sea visible
    await expect(page.locator('h1')).toBeVisible();
    
    // 3. Interactuar con elementos
    await page.locator('input').fill('Texto');
    await page.locator('button').click();
    
    // 4. Verificar resultados
    await expect(page.locator('.success')).toHaveText('Éxito');
  });

  test('debería verificar visibilidad de elementos', async ({ page }) => {
    // Verificar que elemento es visible
    await expect(page.locator('.element')).toBeVisible();
    
    // Verificar que elemento NO es visible
    await expect(page.locator('.error')).not.toBeVisible();
    
    // Verificar texto
    await expect(page.locator('h1')).toHaveText('Título esperado');
    
    // Verificar URL
    await expect(page).toHaveURL(/pagina-esperada/);
    
    // Verificar clase CSS
    await expect(page.locator('button')).toHaveClass(/active/);
  });

  test('debería llenar y enviar formulario', async ({ page }) => {
    // Llenar input de texto
    await page.locator('input[name="nombre"]').fill('Juan');
    
    // Llenar email
    await page.locator('input[type="email"]').fill('juan@example.com');
    
    // Llenar password
    await page.locator('input[type="password"]').fill('pass123');
    
    // Seleccionar opción en select
    await page.locator('select').selectOption('opcion2');
    
    // Clickear checkbox
    await page.locator('input[type="checkbox"]').check();
    
    // Enviar formulario
    await page.locator('button[type="submit"]').click();
    
    // Esperar resultado
    await page.waitForURL('**/exito');
    await expect(page.locator('.success-message')).toBeVisible();
  });

  test('debería esperar elementos dinámicos', async ({ page }) => {
    // Esperar a que aparezca un elemento (máx 30 segundos)
    await page.waitForSelector('.elemento-dinamico');
    
    // Esperar respuesta de API
    await page.waitForResponse(response => 
      response.url().includes('/api/datos') && response.status() === 200
    );
    
    // Esperar cambio de URL
    await page.waitForURL('**/nueva-pagina');
    
    // Esperar con timeout personalizado
    await expect(page.locator('.loading')).not.toBeVisible({ timeout: 5000 });
  });

  test('debería manejar clicks y navegación', async ({ page }) => {
    // Click simple
    await page.locator('button').click();
    
    // Click con espera de navegación
    await Promise.all([
      page.waitForURL('**/nueva-url'),
      page.locator('a[href="/enlace"]').click()
    ]);
    
    // Click en elemento específico de una lista
    await page.locator('text=Opción 3').click();
    
    // Double click
    await page.locator('button').dblClick();
    
    // Click derecho
    await page.locator('button').click({ button: 'right' });
  });

  test('debería capturar pantallas y videos', async ({ page }) => {
    // Captura de toda la página
    await page.screenshot({ path: 'tests/screenshots/pagina-completa.png' });
    
    // Captura de un elemento específico
    await page.locator('header').screenshot({ path: 'tests/screenshots/header.png' });
    
    // Las capturas en caso de error se guardan automáticamente
  });

  test.skip('debería saltar este test', async ({ page }) => {
    // Este test NO se ejecutará
    // Útil para tests en construcción
  });

  test.only('debería ejecutar SOLO este test', async ({ page }) => {
    // Cuando usas .only, solo este test se ejecuta
    // Útil para debugging de un test específico
    // ⚠️ Recuerda remover cuando termines
  });
});

/**
 * ATAJOS ÚTILES PARA SELECTORES
 * 
 * // Por ID
 * page.locator('#myId')
 * 
 * // Por clase
 * page.locator('.myClass')
 * 
 * // Por atributo
 * page.locator('[data-testid="login-button"]')
 * page.locator('input[type="email"]')
 * 
 * // Por texto
 * page.locator('text=Clickeame')
 * page.locator('button:has-text("Enviar")')
 * 
 * // Por rol (recomendado para accesibilidad)
 * page.locator('role=button[name="Enviar"]')
 * page.locator('role=textbox[name="Email"]')
 * 
 * // Combinaciones
 * page.locator('div.container >> button:has-text("Save")')
 */
