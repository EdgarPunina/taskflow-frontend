import axios from 'axios';

export const TOKEN_KEY = 'taskflow_token';
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  timeout: 15000,
  headers: { Accept: 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token && !['/login', '/register'].includes(config.url)) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use((response) => response, (error) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (error.response?.status === 401 && token &&
      error.config?.headers?.Authorization === `Bearer ${token}`) {
    localStorage.removeItem(TOKEN_KEY);
    window.location.replace(`${window.location.pathname}${window.location.search}#/login?session=expired`);
  }
  return Promise.reject(error);
});

export function errorMessage(error) {
  if (!error.response) return 'No pudimos conectar con el servidor. Comprueba tu conexión e inténtalo de nuevo.';
  if (error.response.status === 401) return 'El correo o la contraseña son incorrectos.';
  if (error.response.status === 422) {
    const fields = error.response.data.errors || {};
    if (fields.email?.some((message) => /taken|registrado|uso/i.test(message))) return 'Este correo ya está registrado. Inicia sesión o utiliza otro.';
    if (fields.password) return 'La contraseña debe tener al menos 8 caracteres.';
    if (fields.title) return 'Escribe un título de entre 1 y 255 caracteres.';
    if (fields.email) return 'Escribe un correo electrónico válido.';
    if (fields.name) return 'Escribe un nombre de entre 1 y 255 caracteres.';
    return 'Revisa los datos del formulario e inténtalo de nuevo.';
  }
  if (error.response.status === 404) return 'Esta tarea ya no está disponible. Actualiza el tablero.';
  if (error.response.status === 429) return 'Has realizado demasiadas solicitudes. Espera un momento e inténtalo de nuevo.';
  return 'No pudimos guardar los cambios. Inténtalo de nuevo.';
}

export default api;
