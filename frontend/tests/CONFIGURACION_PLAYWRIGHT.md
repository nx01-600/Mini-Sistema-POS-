# 🎭 CONFIGURACIÓN DE PLAYWRIGHT - GUÍA COMPLETA

## ✅ CHECKLIST DE INSTALACIÓN

### 1. Instalar dependencias (Abre Terminal en `frontend`)
```bash
# Terminal - Ejecuta esto primero
npm install -D @playwright/test

# Luego descarga los navegadores
npx playwright install

# O si prefieres instalar también dependencias del sistema
npx playwright install --with-deps
```

### 2. Estructura de carpetas (Ya está creada)
```
frontend/
├── tests/                          ✅ Carpeta para todas las pruebas
│   ├── helpers.js                  ✅ Funciones auxiliares comunes
│   ├── homepage.spec.js            ✅ Test de página principal
│   ├── login.spec.js               ✅ Test de login
│   ├── navigation.spec.js          ✅ Test de navegación
│   ├── ventas.spec.js              ✅ Test de ventas/compras
│   └── screenshots/                (Se crea automáticamente)
├── playwright.config.js            ✅ Configuración de Playwright
├── vite.config.js                  (Ya existe)
├── package.json                    (Necesita scripts)
└── src/
    └── ...
```

### 3. Agregar scripts a package.json
Abre `frontend/package.json` y reemplaza la sección "scripts":

```json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview",
  "test": "playwright test",
  "test:ui": "playwright test --ui",
  "test:debug": "playwright test --debug",
  "test:headed": "playwright test --headed",
  "test:chrome": "playwright test --project=chromium",
  "test:report": "playwright show-report"
}
```

## 🚀 PRIMERAS PRUEBAS

### Test 1: Ejecutar todas las pruebas
```bash
npm test
```

### Test 2: Ver interfaz gráfica interactiva (RECOMENDADO para comenzar)
```bash
npm run test:ui
```

### Test 3: Ver navegadores en acción
```bash
npm run test:headed
```

### Test 4: Debug paso a paso
```bash
npm run test:debug
```

## 📊 VER RESULTADOS

Después de ejecutar pruebas, puedes ver:

```bash
# Ver reporte HTML
npm run test:report
```

El reporte se abrirá automáticamente en tu navegador.

## 🎯 PRÓXIMOS PASOS

### 1. Actualizar selectores en tests
Los tests usan selectores genéricos. Debes adaptarlos a tu HTML real:

**Antes (genérico):**
```javascript
const emailInput = page.locator('input[type="email"]');
```

**Después (específico a tu proyecto):**
- Abre `src/pages/Login.jsx` 
- Agrega atributos data-testid:
```jsx
<input type="email" data-testid="email-input" />
```

- En el test usa:
```javascript
const emailInput = page.locator('[data-testid="email-input"]');
```

### 2. Configurar autenticación
Si tu app requiere login, crea un archivo `tests/auth.setup.js`:

```javascript
import { test as setup } from '@playwright/test';

setup('authenticate', async ({ page }) => {
  await page.goto('/login');
  await page.locator('[data-testid="email-input"]').fill('admin@test.com');
  await page.locator('[data-testid="password-input"]').fill('password123');
  await page.locator('button[type="submit"]').click();
  
  // Guardar estado autenticado
  await page.context().storageState({ path: 'auth.json' });
});
```

Luego en `playwright.config.js`:
```javascript
use: {
  ...
  storageState: 'auth.json',
}
```

### 3. Tests más realistas
Reemplaza los selectores con los reales de tu aplicación en:
- `tests/login.spec.js` - Actualiza selectores del formulario de login
- `tests/ventas.spec.js` - Actualiza selectores de tu página de ventas
- `tests/navigation.spec.js` - Ajusta para tu sidebar real

## 🔍 COMANDOS ÚTILES

| Comando | Descripción |
|---------|-------------|
| `npm test` | Ejecuta todas las pruebas (sin UI) |
| `npm run test:ui` | Interfaz gráfica interactiva |
| `npm run test:headed` | Ver navegadores en vivo |
| `npm run test:debug` | Debugger paso a paso |
| `npm run test:report` | Ver último reporte HTML |
| `npx playwright test tests/login.spec.js` | Ejecutar un solo archivo |
| `npx playwright test --grep "login"` | Ejecutar tests con "login" en el nombre |

## 💡 TIPS IMPORTANTES

1. **Selectores de test:** Usa `data-testid` en tu HTML para selectores más confiables
2. **Waits:** Siempre espera a que elementos sean visibles antes de interactuar
3. **Screenshots:** Playwright guarda automáticamente capturas de pantalla si falla un test
4. **Modo headed:** Perfecto para ver qué está pasando durante las pruebas
5. **Parallel:** Los tests corren en paralelo por defecto (más rápido)

## ❌ TROUBLESHOOTING

**Error: "Timeout waiting for element"**
- Aumenta el timeout en `playwright.config.js`
- Verifica que el selector es correcto
- Usa `npm run test:headed` para ver qué pasa

**Error: "Connection refused"**
- Asegúrate de que `npm run dev` esté ejecutándose en otro terminal
- Verifica que Vite usa puerto 5173

**Error: "playwright: command not found"**
- Ejecuta: `npm install -D @playwright/test`
- Ejecuta: `npx playwright install`

## 📚 RECURSOS

- [Documentación oficial](https://playwright.dev)
- [Selectores Playwright](https://playwright.dev/docs/selectors)
- [Aserciones](https://playwright.dev/docs/test-assertions)
- [Debugging](https://playwright.dev/docs/debug)
