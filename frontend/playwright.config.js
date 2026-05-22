import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  
  /* Tiempo máximo para cada test */
  timeout: 60000,

  /* Configuración de ejecución */
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,

  /* Reporter para generar reportes de pruebas */
  reporter: 'html',

  /* Configuración compartida para todos los navegadores */
  use: {
    baseURL: 'http://localhost:5173', // Puerto por defecto de Vite
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  /* Configurar proyectos para navegadores principales */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
  ],

  /* Servidor web de prueba */
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
