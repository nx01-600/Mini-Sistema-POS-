# Guía de Pruebas con Playwright

## Ejecutar Pruebas

### Todas las pruebas
```bash
npm test
```

### Solo pruebas públicas (sin login)
```bash
npx playwright test public-pages.spec.js
```

### Solo pruebas del dashboard
```bash
npx playwright test dashboard-tests.spec.js
```

## Tipos de Pruebas

### 1. Pruebas Públicas (`public-pages.spec.js`)
- No requieren autenticación
- Prueban páginas públicas o redirecciones al login
- Ideales para verificar que la app responde correctamente

### 2. Pruebas del Dashboard (`dashboard-tests.spec.js`)
- Inician sesión automáticamente en cada prueba
- No requieren dependencias adicionales ni setup previo
- Útiles para comprobar el dashboard y roles en un entorno limpio

- Inician sesión automáticamente en cada prueba
- No requieren dependencias adicionales ni setup previo
- Útiles para comprobar el dashboard y roles en un entorno limpio



## Credenciales de Prueba
- **Admin**: admin@test.com / admin123
- **Usuario**: usuario@test.com / usuario123

### Personalización
1. **Actualiza selectores**: Los selectores CSS en los tests son genéricos. Usa las DevTools del navegador para encontrar los selectores reales de tu HTML.

2. **Credenciales**: Cambia las credenciales en `dashboard-tests.spec.js` según tu configuración de Firebase.

3. **URLs**: Ajusta las rutas (`/login`, `/dashboard`) según tu enrutamiento.

## Debugging

### Ver tests en navegador
```bash
npx playwright test --ui
```

### Ejecutar en modo debug
```bash
npx playwright test --debug
```

### Ver reportes
```bash
npx playwright show-report
```

## Estructura de Archivos

```
tests/
├── login.spec.js          # Pruebas de login
├── public-pages.spec.js   # Pruebas sin login
├── dashboard-tests.spec.js      # Pruebas del dashboard
├── helpers.js            # Funciones auxiliares
└── ...                    # Otros tests
```

## Consejos

1. **Selectores**: Siempre usa selectores robustos (data-testid, roles ARIA, texto visible)
2. **Timeouts**: Ajusta timeouts según la velocidad de tu app
3. **Paralelización**: Las pruebas corren en paralelo por defecto
4. **CI/CD**: Configura variables de entorno para diferentes entornos