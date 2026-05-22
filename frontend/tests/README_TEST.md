# ARQUITECTURA DE PLAYWRIGHT - TU PROYECTO

### 1. Instalar dependencias (Abre Terminal en `frontend`)
```bash
# Terminal - Ejecuta esto primero
npm install -D @playwright/test

# Luego descarga los navegadores
npx playwright install

# O instalar también dependencias del sistema
npx playwright install --with-deps
```
## Flujo de ejecución

```
┌─────────────────────────────────────────────────────────────┐
│                   Tu Aplicación React                       │
│  (localhost:5173 - npm run dev)                             │
│                                                              │
│  ┌──────────┐  ┌─────────────┐  ┌──────────────────────┐  │
│  │ Pages    │  │ Components  │  │ Utils                │  │
│  │ ├ Login  │  │ ├ Topbar    │  │ ├ globalNotif...    │  │
│  │ ├ Stock  │  │ ├ Sidebar   │  │ └ notifications.js  │  │
│  │ └ Ventas │  │ └ example   │  └──────────────────────┘  │
│  └──────────┘  └─────────────┘                             │
│                     ↑                                        │
│                     │ HTTP                                   │
│                     │ Firebase                              │
│                     ↓                                        │
│            Firebase / Backend                               │
└─────────────────────────────────────────────────────────────┘
         ↑
         │ Playwright Browser
         │
┌─────────────────────────────────────────────────────────────┐
│              Playwright Test Runner                         │
│  (npm test / npm run test:ui)                              │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ playwright.config.js                               │   │
│  │ • baseURL: localhost:5173                          │   │
│  │ • timeout: 30000ms                                 │   │
│  │ • Navegadores: Chromium, Firefox                   │   │
│  │ • Reportes: HTML, Screenshots, Traces             │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌────────────┐  ┌────────────┐  ┌────────────────────┐   │
│  │ tests/     │  │ helpers.js │  │ Utilidades comunes│   │
│  │            │  │            │  │ • fillForm()      │   │
│  │ ├ homepage │  │ Funciones  │  │ • logIn()         │   │
│  │ ├ login    │  │ reutiliz.  │  │ • waitForAPI()    │   │
│  │ ├ navigation      │            │ • screenshots()   │   │
│  │ ├ ventas   │  │            │  │                   │   │
│  │ └ template │  └────────────┘  └────────────────────┘   │
│  └────────────┘                                             │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Ciclo de vida de un test

```
1. playwright.config.js inicia
   ↓
2. webServer (npm run dev) se levanta automáticamente
   ↓
3. Se abre navegador (Chrome, Firefox)
   ↓
4. Test comienza (beforeEach → test → afterEach)
   ↓
5. El test:
   • Navega a URL
   • Busca elementos
   • Interactúa con la página
   • Verifica resultados
   ↓
6. Captura pantalla si falla
   ↓
7. Cierra navegador
   ↓
8. Siguiente test
```


## Relación tests ↔ Componentes

```
login.spec.js
├─ Interactúa con: pages/Login.jsx
│  └─ Verifica campos de email y password
│
homepage.spec.js
├─ Interactúa con: App.jsx
│  └─ Verifica que carga correctamente
│
navigation.spec.js
├─ Interactúa con: components/Sidebar.jsx
│  ├─ components/Topbar.jsx
│  └─ Verifica navegación entre páginas
│

```

## Arquivos de configuración y referencia

```
frontend/
│
├── playwright.config.js          ← Configuración central
│   ├── baseURL: localhost:5173
│   ├── timeout: 30000ms
│   ├── webServer: npm run dev
│   └── projects: [chromium, firefox, webkit]
│
├── tests/
│   ├── helpers.js               ← Funciones auxiliares reutilizables
│   ├── homepage.spec.js         ← Test 1: Página principal
│   ├── login.spec.js            ← Test 2: Fo
│   ├── navigation.spec.js       ← Test 3: Navegación
│   ├── ventas.spec.js           ← Test 4: Módulo de ventas
│   ├── template.spec.js         ← Template para nuevos tests
│   └── screenshots/             ← Capturas automáticas
│       └── (vacío inicialmente)
│
...

## Flujo de un test típico

```javascript
test('debería hacer algo', async ({ page }) => {
  
  // 1. SETUP
  await page.goto('/');                    // Navega a la app
  
  // 2. ACCIÓN
  await page.locator('button').click();    // Interactúa
  
  // 3. VERIFICACIÓN
  await expect(page).toHaveURL(/expected/); // Verifica
});
```

Equivale a:

```
┌─────────────┐
│  Navegador  │
│  Abierto    │
└─────────────┘
       ↓
┌─────────────────────┐
│ Visita página       │
│ localhost:5173      │
└─────────────────────┘
       ↓
┌─────────────────────┐
│ Busca botón         │
│ <button>Enviar</...>│
└─────────────────────┘
       ↓
┌─────────────────────┐
│ Click en botón      │
└─────────────────────┘
       ↓
┌─────────────────────┐
│ Verifica resultado  │
│ URL cambió a...     │
└─────────────────────┘
       ↓
   ✅ PASS o ❌ FAIL
```

## Comandos clave

```
npm test                   → Ejecutar todo silenciosamente
npm run test:ui            → Interfaz gráfica interactiva ⭐
npm run test:headed        → Ver navegadores en acción
npm run test:debug         → Debugger paso a paso
npm run test:report        → Ver reporte HTML último

npm run test:chrome        → Solo Chrome
npm run test:firefox       → Solo Firefox

```

