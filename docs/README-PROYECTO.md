# TaskFlow — Frontend

Tablero Kanban de Edgar Punina en React conectado a la API real de Laravel. Incluye registro, login, tareas por usuario, creación, avance, eliminación, detalle y edición con formularios controlados, useState y Axios.

- Repositorio compartido del equipo: https://github.com/EdgarPunina/taskflow-frontend
- Sitio publicado en GitHub Pages: https://edgarpunina.github.io/taskflow-frontend/
- API pública temporal de la sesión 07: https://acquisition-tahoe-sequence-discrimination.trycloudflare.com/api
- Rama de la Tarea 3, conservada: https://github.com/EdgarPunina/taskflow-frontend/tree/tarea3-edgar
- Despliegues: https://github.com/EdgarPunina/taskflow-frontend/actions/workflows/deploy-pages.yml

**Publicación:** repositorio público con autorización de Edgar Punina. GitHub Pages habilitado con despliegue automático desde main.

![Tablero de TaskFlow](evidencia/sesion07/tablero-desktop.png)

## Stack y ejecución local

React 18, React Router 7, Axios y Vite 8. Node.js 22.12 o posterior; el workflow utiliza Node 24. Desde la raíz del frontend:

```powershell
npm.cmd ci
Copy-Item .env.example .env
npm.cmd run dev -- --host 127.0.0.1 --port 5173 --strictPort
```

Copia .env solo en la primera instalación. VITE_API_URL debe apuntar a la API deseada. Para uso local deja http://localhost:8000/api y arranca el backend con scripts/serve-sqlite.ps1. Abre http://127.0.0.1:5173/#/login y crea una cuenta. No se incluyen contraseñas ni tokens en el repositorio.

## Arquitectura y componentes

```mermaid
flowchart LR
  App[App / HashRouter] --> Auth[Login y Register]
  App --> Guard[PrivateRoute]
  Guard --> Layout[WorkspaceLayout]
  Layout --> Dashboard
  Dashboard --> Board
  Board --> Column
  Column --> TaskCard
  Layout --> Detail[TaskDetail y TaskForm]
  Board --> Axios
  Detail --> Axios
  Auth --> Axios
  Axios -->|HTTPS y Bearer| API[Laravel / Sanctum]
  API --> DB[(Base de datos)]
```

- Board administra las tareas con useState y actualizaciones funcionales. Column y TaskCard reciben props y callbacks.
- TaskDetail carga la tarea mediante su ID; TaskForm controla título, descripción y estado y persiste con PATCH. Cancelar conserva los datos originales.
- Axios agrega el token de localStorage.taskflow_token. El cierre de sesión revoca el token en Laravel. Ante un 401 se elimina la sesión y se conserva la subcarpeta de Pages al redirigir.
- Laravel verifica la propiedad de las tareas. PrivateRoute protege la navegación; la autorización de datos pertenece al servidor.
- En el backend se aplica Observer (GoF) mediante TaskObserver para registrar cambios de estado; las fábricas Eloquent generan fixtures. Ver [arquitectura del backend](https://github.com/EdgarPunina/Proyecto-Laravel-inicial-de-TaskFlow/blob/main/docs/ARQUITECTURA.md).

Las rutas son /#/login, /#/register, /#/dashboard, /#/tasks/:id y /#/tasks/:id/edit. HashRouter permite abrirlas directamente y recargar en un servidor estático. Vite usa base './' para cargar los recursos desde la subcarpeta del repositorio.

## Estilos de sesión 07

src/styles/index.css contiene fuentes locales, variables compartidas, accesibilidad, animaciones fadeIn y reglas adaptables. auth.css, dashboard.css y board.css separan las vistas. El tablero conserva contadores y distintivos por columna, añade bordes de tarjeta según el estado y respeta prefers-reduced-motion. El botón Cerrar sesión funciona también en detalle y edición.

## Compilar y verificar

```powershell
npm.cmd run lint
npm.cmd run build
npm.cmd run preview -- --host 127.0.0.1 --port 4173 --strictPort
```

En otra terminal, con Google Chrome instalado y la API activa:

```powershell
$env:FRONTEND_URL='http://127.0.0.1:4173'
$env:API_URL='https://acquisition-tahoe-sequence-discrimination.trycloudflare.com/api'
npm.cmd run test:e2e
```

API_URL debe coincidir con VITE_API_URL usado al compilar. Nueve pruebas Playwright verifican registro, login, CRUD, persistencia tras F5, aislamiento, logout, errores, detalle, edición y móvil. Para verificar Pages cambia FRONTEND_URL por la URL pública. Los tests crean cuentas sintéticas, limpian tareas y revocan tokens; utiliza una base de práctica.

## Publicar en GitHub Pages

1. En Settings → Pages, habilita Source: GitHub Actions. El repositorio debe admitir Pages según su plan y visibilidad.
2. En Settings → Secrets and variables → Actions → Variables, configura VITE_API_URL con la URL HTTPS del túnel terminada en /api. Es una URL pública, no un secreto.
3. Un push a main o Run workflow ejecuta deploy-pages.yml: npm ci, lint, validación de URL, build y publicación del artefacto dist.
4. Espera a que build y deploy están en verde. Abre la URL pública y comprueba registro → login → crear → avanzar → eliminar → F5, además de detalle y edición.

No se suben dist, node_modules ni .env. Las variables VITE_* se incorporan a los archivos públicos; nunca deben contener secretos. Cambiar VITE_API_URL requiere volver a compilar y desplegar.

**El túnel no es alojamiento permanente.** La API depende del equipo encendido y los procesos Laravel/cloudflared activos. Si reinicias cloudflared, actualiza VITE_API_URL y vuelve a ejecutar Pages antes de la revisión del supervisor. El frontend estático permanece publicado, pero no puede operar con una API apagada.

## Historial

La sesión 06 y la Tarea 3 se integraron en main para la sesión 07. La rama personal tarea3-edgar conserva su entrega original. Consulta [sesión 06](SESION-06.md) y [Tarea 3](TAREA-3.md) para la evidencia previa.
