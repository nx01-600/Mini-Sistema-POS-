# 📑 ÍNDICE - ARCHIVOS CREADOS PARA PLAYWRIGHT

## 🎯 POR DÓNDE EMPEZAR

1. **Lee primero:** [COMIENZA_AQUI.md](./COMIENZA_AQUI.md)
2. **Luego ejecuta:** `npm install -D @playwright/test && npx playwright install && npm test`
3. **Después consulta:** Los otros archivos según tus necesidades

---

## 📂 ARCHIVOS DE CONFIGURACIÓN

### `playwright.config.js`
**Propósito:** Configuración central de Playwright
- Define dónde están los tests (`./tests`)
- Configura navegadores (Chrome, Firefox, Safari)
- Puerto de desarrollo: `localhost:5173`
- Reportes: Screenshots y HTML
- Timeout: 30 segundos por test

**Cuándo editarlo:** Cuando necesites cambiar puerto, navegadores, o comportamiento global

---

## 📄 GUÍAS Y DOCUMENTACIÓN

### `COMIENZA_AQUI.md` ⭐ **LEE ESTO PRIMERO**
**Propósito:** Inicio rápido en 5 minutos
- Pasos básicos de instalación
- Comandos para ejecutar primeros tests
- Troubleshooting rápido
- Cómo actualizar selectores

**Para quién:** Alguien que quiere comenzar YA

### `CONFIGURACION_PLAYWRIGHT.md`
**Propósito:** Guía completa y detallada
- Explicación de cada paso
- Checklist de instalación
- Próximos pasos avanzados
- Troubleshooting extenso

**Para quién:** Quieres entender todo en profundidad

### `PLAYWRIGHT_GUIA.md`
**Propósito:** Referencia rápida de comandos
- Todos los comandos disponibles
- Explicación de cada flag
- Ejemplos de uso

**Para quién:** Necesitas buscar un comando específico

### `ARQUITECTURA_TESTS.md`
**Propósito:** Entender cómo todo se conecta
- Diagrama de flujo
- Relación tests ↔ componentes
- Ciclo de vida de tests
- Estructura del proyecto

**Para quién:** Quieres entender la arquitectura general

---

## 🧪 ARCHIVOS DE TESTS

### `tests/` (carpeta)
Contiene todos tus tests. Estructura:

```
tests/
├── helpers.js              ← Funciones comunes
├── homepage.spec.js        ← Test básico
├── login.spec.js           ← Test de login
├── navigation.spec.js      ← Test de navegación
├── ventas.spec.js          ← Test de ventas/compras
├── template.spec.js        ← Template para crear tus tests
└── screenshots/            ← Capturas automáticas (se genera)
```

### `tests/helpers.js`
**Propósito:** Funciones auxiliares reutilizables
- `fillForm()` - Llenar múltiples campos
- `clickAndWaitForURL()` - Click + esperar navegación
- `waitForApiResponse()` - Esperar llamada API
- `logIn()` - Hacer login
- `takeScreenshot()` - Guardar captura

**Cuándo usarlo:** Cuando necesites código reutilizable

### `tests/homepage.spec.js`
**Propósito:** Test básico de página de inicio
- Verifica que carga la página
- Verifica que existe contenedor root

**Cuándo modificarlo:** Cuando tu página de inicio cambie

### `tests/login.spec.js`
**Propósito:** Tests del formulario de login
- Verifica campos de email y password
- Prueba envío con campos vacíos
- Prueba llenar formulario

**Cuándo modificarlo:** INMEDIATAMENTE - Personaliza los selectores con tu HTML real

### `tests/navigation.spec.js`
**Propósito:** Tests de navegación y sidebar
- Verifica navegación entre páginas
- Prueba sidebar en móvil
- Verifica responsive design

**Cuándo modificarlo:** Cuando quieras testear tu Sidebar.jsx

### `tests/ventas.spec.js`
**Propósito:** Tests del módulo de ventas/compras
- Crear una venta
- Validación de campos
- Filtrar en tabla
- Abrir/cerrar modales

**Cuándo modificarlo:** Para testear GenerarVentasDemo.jsx y páginas de ventas

### `tests/template.spec.js`
**Propósito:** Template vacío con ejemplos abundantes
- Ejemplos de todos los tipos de assertions
- Comentarios explicativos
- Atajos de selectores
- Test.skip y test.only

**Cuándo usarlo:** Copia este archivo para crear nuevos tests

---

## 🔧 OTROS ARCHIVOS

### `.gitignore` (actualizado)
Se agregaron entradas para que Playwright no suba archivos temporales:
- `/test-results/`
- `/playwright-report/`
- `/tests/screenshots/`
- `*.trace`

---

## 📊 FLUJO RECOMENDADO

```
Día 1:
├─ Lee: COMIENZA_AQUI.md
├─ Ejecuta: npm install && npx playwright install
├─ Ejecuta: npm run test:ui
└─ Juega: Abre un test y mira cómo funciona

Día 2:
├─ Personaliza: Selectores en login.spec.js
├─ Personaliza: Selectores en navigation.spec.js
├─ Ejecuta: npm test (verifica que pasen)
└─ Lee: CONFIGURACION_PLAYWRIGHT.md (secciones clave)

Día 3+:
├─ Crea: Nuevos tests copiando template.spec.js
├─ Personaliza: Según tu código real
├─ Ejecuta: npm run test:headed (para debug)
├─ Consulta: helpers.js (funciones disponibles)
└─ Expande: Tests de otros módulos
```

---

## 🔍 BÚSQUEDA RÁPIDA

**Necesito...**
- Instalar → `COMIENZA_AQUI.md`
- Un comando → `PLAYWRIGHT_GUIA.md`
- Entender qué hace un test → `tests/template.spec.js`
- Usar una función auxiliar → `tests/helpers.js`
- Debuggear un problema → `CONFIGURACION_PLAYWRIGHT.md`
- Entender la arquitectura → `ARQUITECTURA_TESTS.md`
- Crear un nuevo test → Copia `tests/template.spec.js`

---

## ✅ CHECKLIST INICIAL

- [ ] Instalé: `npm install -D @playwright/test`
- [ ] Descargué navegadores: `npx playwright install`
- [ ] Ejecuté: `npm run test:ui`
- [ ] Vi los tests en interfaz gráfica
- [ ] Leí: `COMIENZA_AQUI.md`
- [ ] Personalicé selectores de `tests/login.spec.js`
- [ ] Ejecuté: `npm test` y funcionó

---

## 🆘 SOPORTE RÁPIDO

| Problema | Solución |
|----------|----------|
| "playwright not found" | `npm install -D @playwright/test && npx playwright install` |
| Tests no encuentran elementos | Personaliza selectores en los tests (lee COMIENZA_AQUI.md) |
| "Connection refused" | Abre otro terminal y ejecuta: `npm run dev` |
| "Timeout" | Aumenta timeout en `playwright.config.js` |
| ¿Cómo debuggeo? | `npm run test:debug` |
| Ver reporte | `npm run test:report` |

---

## 🎓 PRÓXIMAS LECCIONES

1. ✅ Instalación y setup
2. ⏭️ Personalizar selectores con `data-testid`
3. ⏭️ Tests con autenticación
4. ⏭️ Tests de APIs con Firebase
5. ⏭️ CI/CD (GitHub Actions)
6. ⏭️ Performance testing

---

**Última actualización:** 2026-05-13
**Version:** 1.0
**Estado:** ✅ Listo para usar
