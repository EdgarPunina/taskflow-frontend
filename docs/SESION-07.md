# Sesión 07 — Verificación y publicación

Fecha: 12 de septiembre de 2026. Responsable: Edgar Punina.

## Completado

- Integrada la Tarea 3 en main; tarea3-edgar conserva su entrega.
- Estilos separados, animaciones, contadores, bordes por estado, adaptación móvil y cierre de sesión real.
- HashRouter y base relativa de Vite. Redirección de sesión expirada conserva la subcarpeta; PrivateRoute revisa el token al cambiar la ruta hash.
- API pública: https://acquisition-tahoe-sequence-discrimination.trycloudflare.com/api. GET /tasks sin token devolvió 401 y JSON Unauthenticated; CORS permite el origen del frontend. APP_DEBUG desactivado en el servidor expuesto.
- 23 pruebas backend, 110 aserciones, correctas localmente.
- [CI del backend correcto en GitHub Actions](https://github.com/EdgarPunina/Proyecto-Laravel-inicial-de-TaskFlow/actions/runs/34702383229), commit dbcd271.
- Lint y build del frontend correctos.
- Nueve pruebas Playwright correctas usando la compilación de producción en http://127.0.0.1:4173 y la API pública real. Incluyen registro, login, CRUD y F5, detalle y edición, aislamiento, errores, logout y móvil.
- README y docs/README-PROYECTO.md completos en ambos repositorios, con arquitectura, Observer, comandos y URLs.
- Workflow de Pages preparado y variable de repositorio VITE_API_URL configurada.

## Publicación completada

Edgar Punina autorizó convertir el repositorio del frontend a público. Se cambió la visibilidad y se habilitó GitHub Pages con GitHub Actions como fuente.

Sitio publicado: https://edgarpunina.github.io/taskflow-frontend/.

[Despliegue correcto en GitHub Actions](https://github.com/EdgarPunina/taskflow-frontend/actions/runs/34702547516).

Verificación final: **9 pruebas Playwright aprobadas desde la URL pública de Pages**, contra la API pública real de Cloudflare. Se comprobaron registro, login, creación, avance, eliminación y recarga; detalle, edición y cancelación; aislamiento entre usuarios, sesión inválida, recuperación de errores y diseño móvil. Las capturas de esta carpeta corresponden al sitio publicado.

## Revisión posterior

El túnel depende de este equipo y de Laravel y cloudflared activos. Si se reinicia, cambia su URL: actualizar VITE_API_URL y volver a ejecutar Pages. No equivale a alojamiento permanente.

Las capturas están en docs/evidencia/sesion07. No se versionan archivos de entorno, credenciales, dependencias, bases de datos ni resultados con datos de ejecución.
