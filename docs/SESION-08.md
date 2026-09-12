# Sesión 08: revisión de cambios con agentes de IA

El instructivo declara esta sesión extra, no calificada y sin entregable. La Parte 1 es una práctica personal con Antigravity; la Parte 2 es una demostración del docente con Claude Code. Este registro diferencia el trabajo realizado en el proyecto de las interacciones que debe practicar el estudiante.

## Exploración del proyecto

El estado del tablero vive en `src/components/Board.jsx`: `tasks` y `setTasks` usan `useState`, junto con los estados del formulario, carga, errores y operaciones pendientes. Board consulta Laravel con Axios y pasa tareas y callbacks a Column y TaskCard. Las tarjetas no mantienen una copia independiente del tablero.

`src/App.jsx` define las rutas hash; `src/services/api.js` agrega el token Bearer. `src/pages/TaskDetail.jsx` carga una tarea y `src/components/TaskForm.jsx` controla su edición.

## Práctica personal de Antigravity

La carpeta inicial del IDE estaba vacía y agy no estaba en PATH. Se descargó, revisó y ejecutó el instalador oficial de la CLI, que valida SHA-512 del binario. La CLI quedó instalada en `C:\PROYECTOS\Practica CEDIA\.tools\antigravity\agy.exe`; `--version` devolvió **1.2.2** y `--help` confirmó las opciones `--mode` y `--model`. El instalador agregó la carpeta al PATH del usuario; abre una terminal nueva para usar agy por su nombre. El login aún requiere tu participación.

Desde la raíz de taskflow-frontend puedes iniciarla sin depender del PATH:

```powershell
& '..\.tools\antigravity\agy.exe'
```

1. Abre Antigravity con el comando anterior desde taskflow-frontend. Inicia sesión con tu cuenta de Google si te lo solicita; comprueba el modelo activo en la interfaz.
2. En el modo de revisión, solicita: «Explícame la estructura de este proyecto y dónde vive el estado del tablero. Solo lectura; no modifiques archivos». Contrasta la respuesta con la exploración anterior.
3. Revisa los modos de la interfaz. El PDF describe default, accept-edits y plan, Shift+Tab y /model para la CLI; los controles pueden variar en el IDE. Editar automáticamente no amplía el alcance autorizado.
4. Pide una mejora pequeña, por ejemplo una frase del README que explique Board. Revisa el diff completo antes de aceptar. El comparador del IDE y `git diff` permiten comprobar los archivos y líneas afectados.
5. Conserva únicamente cambios útiles. No ejecutes una restauración global ni agregues archivos ajenos para obtener un árbol limpio. Al comenzar esta sesión ya existía la carpeta no versionada .serena; se conserva fuera de la entrega.

Estos pasos de login, selección de modelo y revisión personal están pendientes de que los realice Edgar. No se afirma haber ejecutado /model, /diff ni una sesión de Antigravity mediante este asistente.

Referencia oficial de instalación: https://antigravity.google/download.

## Demostración aplicada: opción A

Se eligió una sola opción del PDF: confirmación antes de eliminar. No se implementa además el endpoint alternativo de estadísticas.

Plan presentado antes de editar: en el manejador del botón de TaskCard, llamar a `window.confirm('¿Eliminar esta tarea?')`; llamar a `onEliminar(id)` solamente si devuelve true. Cancelar no modifica el tablero ni envía DELETE. La modificación funcional se limita a esa línea de TaskCard; las pruebas y esta documentación acompañan la verificación.

Revisión: el diff debe conservar las props, disabled, accesibilidad, SVG, navegación y avance de estado. El comportamiento autorizado por el usuario se implementó con el asistente de esta conversación, no con Claude Code.

## Cómo probarlo a mano

1. Abre https://edgarpunina.github.io/taskflow-frontend/ e inicia sesión o registra una cuenta de práctica.
2. Crea una tarea y pulsa Eliminar. Debe aparecer exactamente «¿Eliminar esta tarea?».
3. Pulsa Cancelar: la tarjeta permanece. Recarga y comprueba que sigue existiendo.
4. Vuelve a pulsar Eliminar y elige Aceptar: desaparece. Recarga y comprueba que no regresa.
5. Si la API está apagada, reinicia Laravel y el túnel según la guía de sesión 07 antes de probar.

La prueba Playwright de CRUD comprueba el mensaje, la cancelación sin peticiones DELETE, persistencia al recargar y eliminación confirmada. La prueba de recuperación de red acepta el diálogo antes de comprobar el error del servidor.

## Contexto y cierre

CLAUDE.md contiene referencias reales a archivos y comandos, como ejemplo del contexto persistente que muestra el docente con /init. No se instaló Claude Code ni se ejecutó su /init. Según el PDF, /clear limpia la conversación de esa herramienta; no borra los archivos del proyecto. No debe confundirse con git restore o con borrar carpetas.

La sesión se cierra revisando el diff, ejecutando lint, build y las pruebas de navegador, y haciendo commit y push de los archivos seleccionados. La publicación se comprueba en GitHub Actions.

## Verificación de esta ejecución

- `npm.cmd run lint`: correcto.
- `npm.cmd run build`: correcto con VITE_API_URL=http://127.0.0.1:8001/api.
- `npm.cmd run test:e2e`: nueve pruebas aprobadas en 52 segundos con preview en http://127.0.0.1:4173 y Laravel real en http://127.0.0.1:8001/api.
- La URL temporal de Cloudflare de sesión 07 dejó de resolver. La revisión automática de permisos rechazó reabrir el túnel; se requiere autorización del usuario para volver a exponer la API a internet. La verificación pública de sesión 08 queda pendiente. Un workflow de Pages correcto no garantiza que la API temporal esté disponible.

## Criterios para revisar al agente

- Dar contexto real y definir el comportamiento esperado.
- Leer el plan y el diff, incluidos los archivos afectados.
- Probar aceptar, cancelar y los errores relevantes.
- Verificar rutas, funciones y afirmaciones contra el proyecto.
- Supervisar decisiones de autenticación, datos y arquitectura.
- Asumir la responsabilidad de aceptar y publicar el resultado.
