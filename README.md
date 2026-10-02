# Biz Nation Web

Frontend de la plataforma educativa de Biz Nation. Consume la API de `biznation-api`.

**Stack:** Angular 22 (zoneless, OnPush por defecto) · Signals · Signal Forms · `httpResource` · TypeScript 6 estricto · Vitest · ESLint (angular-eslint)

## Cómo ejecutarlo

Requiere **Node 22.22.3+ o 24** y la API corriendo en `http://localhost:3000`.

```bash
npm install
npm start          # http://localhost:4200
```

`ng serve` redirige `/api/*` al backend (`proxy.conf.json`), así no hace falta CORS en desarrollo. En AWS, CloudFront enruta `/api/*` al ALB con el mismo efecto.

En el login hay botones de **cuentas de prueba** (admin y estudiante) que usan los datos del seed del backend.

```bash
npm test           # 33 tests (Vitest)
npm run lint       # TypeScript + plantillas
npm run build      # producción
```

> El build de producción descarga Google Fonts para embeberlas. Sin acceso a internet, el paso se queda esperando.

## Qué incluye

**Estudiante:** catálogo con búsqueda, filtros por progreso, orden y "solo mis cursos" · detalle del curso con el recorrido de lecciones, inscripción y marcado de lecciones · "Mi progreso" con su segmento y un mensaje orientado a la siguiente acción.

**Administrador:** resumen con la distribución de estudiantes por segmento y los cursos que mejor funcionan · listado de cursos con filtros por título, estado, fechas y progreso promedio · editor de curso (datos, lecciones, publicar, eliminar) · avance por estudiante en cada curso · estudiantes por segmento con las razones del puntaje · mensajes de WhatsApp clasificados por tema, con reintento de los fallidos.

Capturas en [`docs/capturas`](docs/capturas).

## Estructura

```
src/app/
├── core/                    # Singleton, sin UI
│   ├── api/                 # API_URL, Page<T>, ApiError, toHttpParams
│   ├── auth/                # AuthService (signals), interceptores, guards, JWT, storage
│   ├── data-access/         # CoursesApi, ProgressApi, AutomationApi, WebhooksApi
│   ├── models/              # Contratos tipados del API
│   └── notifications/       # Toasts y confirmaciones
├── shared/                  # Reutilizable y sin estado de negocio
│   ├── ui/                  # ProgressBar, Badge, Paginator, EmptyState, LoadError...
│   ├── forms/               # FieldError, serverErrors()
│   ├── routing/             # injectQueryState(): la URL como estado de filtros
│   └── pipes/               # relativeTime
├── layout/                  # Shell (barra lateral por rol)
└── features/                # Una carpeta por área, cada pantalla con carga diferida
    ├── auth/  student/  admin/
```

## Decisiones técnicas

**Tipado estricto de punta a punta**
- `strict`, `strictTemplates`, `noUncheckedIndexedAccess` y `typeCheckHostBindings` activos. El lint prohíbe `any`, `$any` en plantillas y el operador `!`.
- Los contratos del API están en `core/models`. Las vistas de admin y estudiante son **tipos distintos** (`AdminCourse` y `StudentCourse`), porque el backend responde distinto según el rol.
- Los eventos de webhook son una **unión discriminada** por `eventType`: dentro de `@if (event.eventType === 'message')` la plantilla sabe que `payload.text` existe.
- `Record<Segment, …>` y `satisfies` obligan a cubrir todos los casos: si el backend agrega un segmento, el compilador señala cada lugar a actualizar.
- Lo que llega como `unknown` (localStorage, `details` de un error) se valida con *type guards* antes de usarse.

**Datos y estado con signals**
- **Lecturas con `httpResource`** (estable en v22): reciben funciones reactivas. Si cambia un filtro, la petición se repite sola y la anterior se cancela. Expone `value`, `isLoading`, `error` y `reload` sin suscripciones manuales.
- **Escrituras con `HttpClient`**, disparadas por acciones del usuario.
- **La URL es el estado de los filtros:** los query params llegan como `input()` gracias a `withComponentInputBinding()`. Los enlaces se pueden compartir, se pueden recargar y el botón "atrás" funciona. Los nombres son legibles (`?progreso=en-curso`) y los valores manipulados se ignoran.
- `AuthService` expone la sesión como signals de solo lectura (`user`, `isAdmin`, `homeUrl`) y cierra la sesión justo cuando expira el JWT.

**Formularios con Signal Forms** (`form`, `[formField]`, `[formRoot]`): las reglas se declaran en un esquema tipado, el envío está integrado y los errores del servidor se pegan al campo correspondiente con `serverErrors()`.

**Errores homogéneos:** todo error HTTP se convierte en `ApiError` con un `code` tipado. Los componentes reaccionan a códigos concretos (por ejemplo, `COURSE_HAS_PROGRESS` ofrece "Despublicar en su lugar") y nunca manipulan `HttpErrorResponse`.

**Seguridad y rutas**
- Guards funcionales con `canMatch`: un estudiante nunca descarga el código de administración. Son UX: la autorización real ocurre en el backend.
- El interceptor solo adjunta el token a peticiones hacia nuestro API. Ante un 401 en una ruta protegida cierra la sesión y conserva la URL de retorno.
- `returnUrl` está protegido contra redirecciones abiertas.

**Rendimiento:** zoneless, OnPush, cada pantalla en su propio chunk y carga inicial de unos 88 kB transferidos.

**Accesibilidad:** enlace para saltar al contenido, foco visible, `aria-invalid` y `aria-describedby` en formularios, barras de progreso con `role="progressbar"`, confirmaciones con `<dialog>` nativo, títulos de página por ruta y respeto de `prefers-reduced-motion`. El lint incluye las reglas de accesibilidad de angular-eslint.

**Diseño:** sistema de tokens propio sobre la marca de Biz Nation: azul marino, el amarillo de "El movimiento amarillo" y el violeta de sus franjas. El amarillo se reserva para el progreso y la acción principal. Tipografías: Montserrat en títulos y Source Sans 3 en texto. Sin librería de componentes: la app es pequeña y así el CSS queda bajo control.

## Trade-offs

| Decisión | Lo que se gana | Lo que se cede |
| --- | --- | --- |
| Token en `localStorage` | Simple y sobrevive a recargas | Legible por JavaScript ante un XSS; una cookie httpOnly sería más segura |
| Tipos escritos a mano | Claros y documentados | Pueden desalinearse del backend (ver mejoras) |
| Signal Forms | API moderna, tipada y coherente con signals | Es reciente; hay menos ejemplos que con Reactive Forms |
| Sin librería de UI | Bundle pequeño e identidad propia | Más CSS propio que mantener |
| Recargar tras cada mutación | Siempre muestra el estado real del servidor | Una petición extra (se podría actualizar de forma optimista) |

## Mejoras futuras

1. **Generar los tipos desde el OpenAPI del backend** (`openapi-typescript`) y validar respuestas en tiempo de ejecución.
2. **Cookie httpOnly + refresh token** en lugar de `localStorage`.
3. **Pruebas end-to-end con Playwright** de los flujos principales.
4. **Actualizaciones optimistas** al completar lecciones.
5. **Gestión de usuarios** desde el panel (el backend ya la expone).
6. **Mensajes salientes de WhatsApp** a estudiantes en riesgo, directamente desde su fila.
