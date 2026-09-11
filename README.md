# TaskFlow frontend

Tablero Kanban en React conectado a la API real de Laravel Sanctum de las sesiones 04 y 05. Implementa la práctica de la sesión 06: registro, login, tareas propias, creación, avance de estado, eliminación y ruta privada.

Repositorio del equipo: [EdgarPunina/taskflow-frontend](https://github.com/EdgarPunina/taskflow-frontend) (privado).

![Tablero de TaskFlow](docs/evidencia/tablero-desktop.png)

## Iniciar la aplicación

Requisitos: Node.js 22.12 o posterior (verificado con 24.16), npm y el backend de TaskFlow con Sanctum y sus migraciones ejecutadas. Para las pruebas de navegador también se necesita Google Chrome.

En una terminal, desde la carpeta hermana `taskflow-backend`:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\serve-sqlite.ps1
```

El backend queda en `http://127.0.0.1:8000`, usando la base SQLite de práctica. Si prefieres el MySQL configurado en `.env`, enciende MySQL, ejecuta `php artisan migrate` y luego `php artisan serve`.

En otra terminal, desde `taskflow-frontend`:

```powershell
npm.cmd ci
npm.cmd run dev -- --host 127.0.0.1 --port 5173 --strictPort
```

Abre **http://127.0.0.1:5173**. La raíz redirige a `/login`; el enlace **Crear cuenta** lleva a `/register`. Puedes registrar tu propia cuenta o usar las credenciales de demostración de la sesión 05, guardadas localmente en `taskflow-backend/storage/app/practice-credentials.json`. Esas credenciales no están en el repositorio.

En PowerShell se usa `npm.cmd` para evitar el bloqueo de `npm.ps1` por la política de ejecución. En otras terminales puedes usar `npm` directamente.

## Configuración de la API

`src/services/api.js` usa `http://localhost:8000/api` por defecto. Para apuntar a otra instancia, copia `.env.example` a `.env`, modifica `VITE_API_URL` y reinicia Vite. No incluyas secretos en variables `VITE_*`: se incorporan al frontend.

El interceptor de Axios añade `Accept: application/json` y el token Bearer de `localStorage.taskflow_token` a las peticiones protegidas. Las respuestas de tareas se leen desde `response.data.data`. Un token revocado elimina la sesión local y redirige al login. El cierre de sesión llama a `/logout` antes de borrar el token local.

La configuración CORS existente de Laravel permite estas llamadas entre puertos. La autorización y el aislamiento de datos los aplica Laravel; `PrivateRoute` controla la navegación del frontend.

## Componentes

```text
App (BrowserRouter)
├── /login → Login
├── /register → Register
└── /dashboard → PrivateRoute → Dashboard
                                └── Board (estado y operaciones API)
                                    └── Column (presenta las tareas de un estado)
                                        └── TaskCard (props y callbacks)
```

El estado de tareas vive en `Board`, padre común de las columnas. Cada cambio usa actualizaciones funcionales de estado para conservar las operaciones concurrentes. `Column` y `TaskCard` reciben props; el ID procede siempre de la base de datos. Las peticiones iniciales se cancelan al desmontar el componente. Crear, avanzar y eliminar se reflejan en pantalla después de recibir una respuesta exitosa de Laravel.

Se incluyen validación del formulario, estados de carga, reintento de carga, botones bloqueados durante operaciones, mensajes accesibles, estilos móviles y fuentes servidas desde la propia aplicación.

## Comprobar el proyecto

Con frontend y backend activos:

```powershell
npm.cmd run lint
npm.cmd run build
npm.cmd run test:e2e
```

Las cinco pruebas Playwright utilizan Chrome y la API real. Verifican rutas, registro, login, persistencia después de recargar, avance hasta completada, eliminación, aislamiento entre dos cuentas, revocación al cerrar sesión, validaciones, token inválido y diseño móvil. Solo se simula la pérdida de red en la prueba específica de recuperación; los usuarios, tareas y tokens se crean en Laravel.

Las pruebas crean usuarios de prueba únicos, eliminan sus tareas y revocan sus tokens. No uses una base de producción. Los resultados completos quedan en `test-results/`, excluido de Git; las capturas de evidencia se guardan en `docs/evidencia/`.

`FRONTEND_URL` y `API_URL` permiten apuntar las pruebas a otros servidores. `API_URL` debe coincidir con el backend configurado en `VITE_API_URL`.

## Entrega

Consulta [docs/SESION-06.md](docs/SESION-06.md) para el análisis del instructivo, las comprobaciones y el estado de la entrega del equipo. El despliegue en GitHub Pages y la vista de detalle/edición de la Tarea 3 se describen en el PDF como trabajo de la siguiente entrega; esta implementación completa los pasos 0 a 7 de la práctica actual.
