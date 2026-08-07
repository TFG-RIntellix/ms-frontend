# ms-frontend

**Aplicación web (SPA) de la plataforma RIntellix.**

`Angular 19` · `Standalone Components` · `PrimeNG` · `Tailwind CSS` · `Keycloak (OIDC)`

---

## 1. Descripción general

`ms-frontend` es el cliente web que utilizan los
analistas de riesgo para operar RIntellix de principio a fin: consultar solicitudes de crédito,
lanzar e inspeccionar simulaciones de riesgo, revisar los resultados del scoring con su
explicación basada en SHAP, y descargar los informes PDF generados. Se comunica exclusivamente
con el backend a través de `ms-sec-gateway`, que autentica cada petición contra Keycloak.

## 2. Aspectos clave del sistema

- **Standalone components, sin NgModules.** Construido con la API de componentes independientes
  de Angular y rutas con carga diferida (`loadComponent` / `loadChildren`), manteniendo el
  *bundle* inicial reducido y cada funcionalidad autocontenida.
- **Estructura orientada a funcionalidades.** `features/` contiene una carpeta por capacidad de
  negocio — `home`, `login`, `requests`, `scoring`, `simulate`, `simulations`, `reports` —
  mientras que `core/` agrupa los aspectos transversales y `shared/` los bloques reutilizables,
  puramente de presentación.
- **Autenticación mediante Keycloak (OIDC).** `core/auth` integra `keycloak-angular` /
  `keycloak-js`; un `authGuard` protege todas las rutas bajo el layout principal, y un
  interceptor HTTP (`core/interceptors`) adjunta el token de acceso a cada petición saliente a
  la API.
- **Paginación en servidor sincronizada con la URL.** Las vistas de listado (solicitudes,
  simulaciones) utilizan carga diferida en el servidor: la página actual, el tamaño de página y
  los filtros se mantienen sincronizados con los parámetros de consulta de la URL, y un
  **Resolver** de Angular (`request.resolver.ts`) precarga los datos de la ruta antes de que el
  componente se renderice.
- **Interfaz consciente de la explicabilidad.** La funcionalidad `scoring` representa los
  factores de riesgo basados en SHAP devueltos por `ms-model` (a través de `ms-risk-engine`),
  mediante un componente de gráfico dedicado (`ShapDriversChartComponent`, construido sobre
  Chart.js) para que los analistas puedan ver *por qué* una solicitud obtuvo esa puntuación.
- **Sistema de diseño PrimeNG + Tailwind.** Los componentes de interfaz proceden de PrimeNG
  (con tema aplicado vía `@primeng/themes`), el estilado de utilidades de Tailwind CSS, los
  iconos de `lucide-angular`, y animaciones Lottie para estados vacíos/de carga.

### Mapa de rutas (nivel superior)

| Ruta | Funcionalidad | Notas |
|---|---|---|
| `/login` | `login` | Pública, fuera del layout autenticado |
| `/home` | `home` | Panel de inicio |
| `/requests/**` | `requests` | Rutas de la funcionalidad con carga diferida |
| `/simulations/**` | `simulations` | Rutas de la funcionalidad con carga diferida |
| `/reports` | `reports` | Listado / descarga de informes |

### Estructura del repositorio

El siguiente esquema ilustra la distribución del código fuente y cómo las piezas clave de la arquitectura descrita encajan en las carpetas principales del proyecto:

![Estructura de directorios](./estructura_directorios_ms_frontend.svg)

## 3. Tecnologías

- **Framework:** Angular 19 (standalone components, `zone.js`)
- **Librería de UI:** PrimeNG 19 + PrimeIcons
- **Estilos:** Tailwind CSS (`@tailwindcss/postcss`)
- **Gráficos:** Chart.js
- **Autenticación:** `keycloak-angular`, `keycloak-js`
- **Iconos / animación:** `@lucide/angular`, `ngx-lottie` / `@lottiefiles/dotlottie-web`
- **Testing:** Jasmine + Karma

## 4. Requisitos previos

- Node.js (versión LTS compatible con Angular 19) y npm
- Angular CLI (`npm install -g @angular/cli`, o usar `npx ng`)
- `ms-sec-gateway` (y, transitivamente, el resto del backend) en ejecución y accesible, además
  de un realm de Keycloak configurado, para que la aplicación pueda autenticarse y obtener datos
  reales

## 5. Puesta en marcha

> [!IMPORTANT]
> **Despliegue global de la plataforma**
> Este repositorio contiene únicamente el código del cliente web. Para levantar la plataforma RIntellix completa (incluyendo Keycloak, bases de datos y el resto de microservicios), clona el repositorio principal de infraestructura **[TFG-RIntellix/rintellix-deployment]** y sigue sus instrucciones.

Los siguientes comandos se proporcionan para el desarrollo local, revisión de código y pruebas:

```bash
# 1. Clonar el repositorio
git clone https://github.com/TFG-RIntellix/ms-frontend.git
cd ms-frontend

# 2. Instalar dependencias
npm install
```

### Compilación

```bash
npm run build
# el bundle de producción se genera en dist/
```

### Pruebas

```bash
npm test
# ejecuta los tests unitarios con Karma
```

## 6. Configuración

La configuración en tiempo de ejecución (URL del gateway del backend, realm/client id de
Keycloak) está centralizada en `src/app/core/config` y se consume mediante *injection tokens* en
`core/tokens`. Ajusta estos valores para apuntar a la infraestructura de despliegue antes de 
ejecutar la aplicación contra datos reales.

| Variable/Propiedad | Descripción | Valor por defecto |
|---|---|---|
| `gatewayUrl` | URL base del API Gateway del backend (`ms-sec-gateway`) | `http://localhost:8085` |
| `keycloak.url` | URL de la instancia de Keycloak para autenticación | `http://localhost:8180` |
| `keycloak.realm` | Nombre del realm (dominio) en Keycloak | `rintellix` |
| `keycloak.clientId` | Identificador del cliente OIDC configurado en Keycloak | `rintellix-spa` |

## 7. Servicios relacionados

- **ms-sec-gateway** — único punto de entrada al backend y gateway de autenticación utilizado
  por esta SPA.
- **ms-core-data**, **ms-risk-engine**, **ms-reporting** — accedidos de forma indirecta, a
  través del gateway.

## 8. Autora

Lucía Fernández Mancebo — TFG *RIntellix*, Universidad de Cantabria.



