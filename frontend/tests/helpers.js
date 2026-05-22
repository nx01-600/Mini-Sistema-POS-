export const loginAsUser = async (page, email = 'mcaguz11@gmail.com', password = 'Hola111.') => {
  await page.goto('/');

  // Abrir modal (botón correcto)
  await page.locator('button:not([type="submit"]):has-text("Iniciar sesión")').click();

  const loginForm = page.locator('form').filter({ hasText: 'Iniciar sesión' }).first();

  await loginForm.locator('input[name="email"]').fill(email);
  await loginForm.locator('input[name="password"]').fill(password);

  // CAPTCHA fake
  await loginForm.locator('#captcha-login').check();

  await loginForm.locator('button[type="submit"]').click();

  await page.waitForURL(/.*\/(dashboard|compras)$/, { timeout: 30000 });
};
// opcional (pero útil)
export const goToCompras = async (page) => {
  await page.goto('/compras');
  await page.waitForURL('**/compras');
};