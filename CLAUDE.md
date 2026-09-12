# Contexto de TaskFlow para trabajar con un agente

Este archivo se preparó mediante revisión del proyecto; no se generó ejecutando /init en Claude Code.

- React 18 y Vite 8. Node 22.12 o posterior; CI usa Node 24.
- src/App.jsx define las rutas con HashRouter para GitHub Pages.
- src/components/Board.jsx mantiene tasks y los estados de carga, errores y operaciones con useState. Column y TaskCard reciben props y callbacks.
- src/components/TaskCard.jsx solicita confirmación antes de llamar a onEliminar(id).
- src/pages/TaskDetail.jsx y src/components/TaskForm.jsx implementan detalle y edición.
- src/services/api.js configura Axios desde VITE_API_URL y agrega el token Bearer. Laravel aplica la autorización real.
- npm.cmd run lint y npm.cmd run build verifican el frontend. npm.cmd run test:e2e usa Chrome y una API real de práctica.
- FRONTEND_URL selecciona el sitio para Playwright; API_URL debe coincidir con VITE_API_URL usado en el build.
- .github/workflows/deploy-pages.yml publica main en GitHub Pages.
- Revisar git status y el diff; conservar cambios ajenos y no incluir .env, tokens, dependencias ni bases de datos.
- Limitar cada cambio al comportamiento solicitado. Verificar tanto el caso exitoso como la cancelación o fallo relevante.

Las instrucciones del usuario y del entorno tienen prioridad sobre este documento.
