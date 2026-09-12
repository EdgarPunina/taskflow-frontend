import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import { appUrl } from './urls.js';

const API = process.env.API_URL || 'http://localhost:8000/api';
const password = 'password123';
const emailFor = (prefix) => `${prefix}.${Date.now()}.${Math.random().toString(36).slice(2, 7)}@example.com`;

async function register(page, email, name = 'Ana') {
  await page.goto(appUrl('/register'));
  await page.getByLabel('Nombre', { exact: true }).fill(name);
  await page.getByLabel('Correo electrónico').fill(email);
  await page.getByLabel('Contraseña', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Crear cuenta' }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByLabel('Nueva tarea')).toBeEnabled();
}

async function login(page, email, pass = password) {
  await page.goto(appUrl('/login'));
  await page.getByLabel('Correo electrónico').fill(email);
  await page.getByLabel('Contraseña', { exact: true }).fill(pass);
  await page.getByRole('button', { name: 'Entrar', exact: true }).click();
}

async function addTask(page, title) {
  await page.getByLabel('Nueva tarea').fill(title);
  await page.getByRole('button', { name: 'Agregar', exact: true }).click();
  await expect(page.getByRole('article', { name: title, exact: true })).toBeVisible();
  await expect(page.getByLabel('Nueva tarea')).toHaveValue('');
}

async function revokeAndClean(page) {
  const token = await page.evaluate(() => localStorage.getItem('taskflow_token'));
  if (!token) return;
  const headers = { Authorization: `Bearer ${token}`, Accept: 'application/json' };
  const response = await page.request.get(`${API}/tasks`, { headers });
  if (response.ok()) {
    for (const task of (await response.json()).data) {
      await page.request.delete(`${API}/tasks/${task.id}`, { headers });
    }
    await page.request.post(`${API}/logout`, { headers });
  }
}

test('rutas privadas y desconocidas redirigen al login', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  for (const url of ['/', '/dashboard', '/ruta-inexistente']) {
    await page.goto(appUrl(url));
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole('button', { name: 'Entrar', exact: true })).toBeVisible();
  }
  await page.getByRole('link', { name: 'Crear cuenta' }).click();
  await expect(page).toHaveURL(/\/register$/);
  expect(errors).toEqual([]);
  fs.mkdirSync('docs/evidencia/sesion07', { recursive: true });
  await page.goto(appUrl('/login'));
  await page.screenshot({ path: 'docs/evidencia/sesion07/login-desktop.png', fullPage: true });
});

test('registro, CRUD persistente, aislamiento entre cuentas y logout con API real', async ({ page, browser }) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  const anaEmail = emailFor('ana-ui');
  const contextB = await browser.newContext();
  const betoPage = await contextB.newPage();
  try {
    await register(page, anaEmail);
    await expect(page.getByRole('article')).toHaveCount(0);
    await expect(page.getByRole('region')).toHaveCount(3);
    await page.getByLabel('Nueva tarea').fill('   ');
    await page.getByRole('button', { name: 'Agregar', exact: true }).click();
    await expect(page.getByRole('alert')).toContainText('Escribe un título');
    await expect(page.getByRole('article')).toHaveCount(0);

    const title = 'Preparar la presentación de TaskFlow';
    await addTask(page, title);
    await page.reload();
    await expect(page.getByRole('region', { name: 'Pendiente', exact: true }).getByRole('article', { name: title })).toBeVisible();
    await page.getByRole('article', { name: title }).getByRole('button', { name: 'Avanzar' }).click();
    await expect(page.getByRole('region', { name: 'En progreso', exact: true }).getByRole('article', { name: title })).toBeVisible();
    await page.reload();
    await expect(page.getByRole('region', { name: 'En progreso', exact: true }).getByRole('article', { name: title })).toBeVisible();

    // Otra cuenta real, en un contexto independiente, no recibe las tareas de Ana.
    await register(betoPage, emailFor('beto-ui'), 'Beto');
    await expect(betoPage.getByRole('article')).toHaveCount(0);
    const anaToken = await page.evaluate(() => localStorage.getItem('taskflow_token'));
    const own = await page.request.get(`${API}/tasks`, { headers: { Authorization: `Bearer ${anaToken}` } });
    const id = (await own.json()).data[0].id;
    const betoToken = await betoPage.evaluate(() => localStorage.getItem('taskflow_token'));
    const foreign = await betoPage.request.get(`${API}/tasks/${id}`, { headers: { Authorization: `Bearer ${betoToken}`, Accept: 'application/json' } });
    expect(foreign.status()).toBe(404);

    await page.getByRole('article', { name: title }).getByRole('button', { name: 'Avanzar' }).click();
    await expect(page.getByRole('region', { name: 'Completada', exact: true }).getByRole('article', { name: title })).toBeVisible();
    await page.reload();
    const completed = page.getByRole('region', { name: 'Completada', exact: true }).getByRole('article', { name: title });
    await expect(completed).toBeVisible();
    await expect(completed.getByRole('button', { name: 'Avanzar' })).toHaveCount(0);
    await addTask(page, 'Revisar los entregables de la sesión');
    await addTask(page, 'Organizar las próximas tareas');
    await page.getByRole('article', { name: 'Revisar los entregables de la sesión' }).getByRole('button', { name: 'Avanzar' }).click();
    await expect(page.getByRole('region', { name: 'En progreso', exact: true }).getByRole('article')).toHaveCount(1);
    await page.screenshot({ path: 'docs/evidencia/sesion07/tablero-desktop.png', fullPage: true });

    let confirmation;
    let deleteRequests = 0;
    page.on('request', (request) => { if (request.method() === 'DELETE') deleteRequests++; });
    page.once('dialog', async (dialog) => {
      confirmation = { type: dialog.type(), message: dialog.message() };
      await dialog.dismiss();
    });
    await completed.getByRole('button', { name: `Eliminar ${title}` }).click();
    expect(confirmation).toEqual({ type: 'confirm', message: '¿Eliminar esta tarea?' });
    await page.reload();
    await expect(completed).toBeVisible();
    expect(deleteRequests).toBe(0);
    page.once('dialog', (dialog) => dialog.accept());
    await completed.getByRole('button', { name: `Eliminar ${title}` }).click();
    await expect(page.getByRole('article', { name: title })).toHaveCount(0);
    await page.reload();
    await expect(page.getByLabel('Nueva tarea')).toBeEnabled();
    await expect(page.getByRole('article', { name: title })).toHaveCount(0);
    await page.getByRole('button', { name: 'Cerrar sesión' }).click();
    await expect(page).toHaveURL(/\/login$/);
    expect(await page.evaluate(() => localStorage.getItem('taskflow_token'))).toBeNull();
    expect((await page.request.get(`${API}/tasks`, { headers: { Authorization: `Bearer ${anaToken}`, Accept: 'application/json' } })).status()).toBe(401);
    await login(page, anaEmail);
    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByRole('article')).toHaveCount(2);
    expect(errors).toEqual([]);
  } finally {
    await revokeAndClean(page);
    await revokeAndClean(betoPage);
    await contextB.close();
  }
});

test('errores de credenciales y correo duplicado se muestran sin perder el formulario', async ({ page }) => {
  const email = emailFor('validacion-ui');
  await register(page, email);
  await page.getByRole('button', { name: 'Cerrar sesión' }).click();
  await expect(page).toHaveURL(/\/login$/);
  await login(page, email, 'incorrecta');
  await expect(page.getByRole('alert')).toContainText('correo o la contraseña');
  await expect(page.getByLabel('Correo electrónico')).toHaveValue(email);
  await page.goto(appUrl('/register'));
  await page.getByLabel('Nombre', { exact: true }).fill('Duplicado');
  await page.getByLabel('Correo electrónico').fill(email);
  await page.getByLabel('Contraseña', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Crear cuenta' }).click();
  await expect(page.getByRole('alert')).toContainText('ya está registrado');
  await expect(page).toHaveURL(/\/register$/);
});

test('token inválido vuelve al login y una carga fallida permite reintentar', async ({ page }) => {
  await page.goto(appUrl('/login'));
  await page.evaluate(() => localStorage.setItem('taskflow_token', 'token-invalido'));
  await page.goto(appUrl('/dashboard'));
  await expect(page).toHaveURL(/\/login\?session=expired$/);
  await expect(page.getByRole('status')).toContainText('Tu sesión terminó');
  expect(await page.evaluate(() => localStorage.getItem('taskflow_token'))).toBeNull();
  try {
    // Solo se simula la pérdida de red. Usuarios y operaciones siguen usando Laravel real.
    await page.route('**/api/tasks', (route) => route.abort('failed'));
    await page.goto(appUrl('/register'));
    await page.getByLabel('Nombre', { exact: true }).fill('Recuperación');
    await page.getByLabel('Correo electrónico').fill(emailFor('red-ui'));
    await page.getByLabel('Contraseña', { exact: true }).fill(password);
    await page.getByRole('button', { name: 'Crear cuenta' }).click();
    await expect(page.getByRole('alert')).toContainText('No pudimos conectar');
    await page.unroute('**/api/tasks');
    await page.getByRole('button', { name: 'Reintentar' }).click();
    await expect(page.getByLabel('Nueva tarea')).toBeEnabled();
    await expect(page.getByRole('alert')).toHaveCount(0);
    await addTask(page, 'Guardar incluso después de recuperar conexión');
    await page.route('**/api/tasks/*', (route) => route.abort('failed'));
    page.once('dialog', (dialog) => dialog.accept());
    await page.getByRole('button', { name: 'Eliminar Guardar incluso después de recuperar conexión' }).click();
    await expect(page.getByRole('alert')).toContainText('No pudimos conectar');
    await expect(page.getByRole('article')).toHaveCount(1);
    await page.unroute('**/api/tasks/*');
  } finally { await revokeAndClean(page); }
});

test('tablero móvil sin desbordamiento y controles funcionales', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  try {
    await register(page, emailFor('movil-ui'), 'Ana');
    await addTask(page, 'Organizar mi semana desde el móvil');
    await page.getByRole('button', { name: 'Avanzar' }).click();
    await expect(page.getByRole('region', { name: 'En progreso', exact: true }).getByRole('article')).toHaveCount(1);
    await expect(page.getByRole('button', { name: 'Cerrar sesión' })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await page.screenshot({ path: 'docs/evidencia/sesion07/tablero-movil.png', fullPage: true });
  } finally { await revokeAndClean(page); }
});
