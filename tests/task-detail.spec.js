import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import { appUrl } from './urls.js';

const API = process.env.API_URL || 'http://localhost:8000/api';
let token;
let task;

test.beforeEach(async ({ page, request }) => {
  const registration = await request.post(`${API}/register`, { data: {
    name: 'Edgar', email: `detalle.${Date.now()}.${Math.random().toString(36).slice(2, 7)}@example.com`, password: 'password123',
  } });
  expect(registration.ok()).toBeTruthy();
  token = (await registration.json()).token;
  const created = await request.post(`${API}/tasks`, { headers: { Authorization: `Bearer ${token}` }, data: {
    title: 'Preparar la entrega de React', description: 'Revisar el detalle de las tareas.\nComprobar el guardado.', status: 'pendiente',
  } });
  expect(created.status()).toBe(201);
  task = (await created.json()).data;
  await page.goto(appUrl('/login'));
  await page.evaluate((value) => localStorage.setItem('taskflow_token', value), token);
});

test.afterEach(async ({ request }) => {
  if (token) {
    const headers = { Authorization: `Bearer ${token}`, Accept: 'application/json' };
    if (task) await request.delete(`${API}/tasks/${task.id}`, { headers });
    await request.post(`${API}/logout`, { headers });
  }
  task = null;
  token = null;
});

test('detalle desde tarjeta y edición persisten al recargar y volver al tablero', async ({ page, request }) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(appUrl('/dashboard'));
  await page.getByRole('link', { name: task.title }).click();
  await expect(page).toHaveURL(new RegExp(`/tasks/${task.id}$`));
  await expect(page.getByRole('heading', { name: task.title })).toBeVisible();
  await expect(page.locator('.task-description')).toHaveText(task.description);
  await expect(page.getByText(task.created_at, { exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'Editar tarea', exact: false }).click();
  await expect(page.getByLabel('Título', { exact: true })).toHaveValue(task.title);
  await expect(page.getByLabel('Descripción', { exact: false })).toHaveValue(task.description);
  await expect(page.getByLabel('Estado', { exact: true })).toHaveValue('pendiente');
  await page.getByLabel('Título', { exact: true }).fill('Entregar la tarea 3 de TaskFlow');
  await page.getByLabel('Descripción', { exact: false }).fill('Detalle y edición listos.\nCompartir el enlace de mi rama personal.');
  await page.getByLabel('Estado', { exact: true }).selectOption('en_progreso');
  fs.mkdirSync('docs/evidencia/sesion07/tarea3', { recursive: true });
  await page.screenshot({ path: 'docs/evidencia/sesion07/tarea3/editar-desktop.png', fullPage: true });
  await page.getByRole('button', { name: 'Guardar cambios' }).click();
  await expect(page).toHaveURL(new RegExp(`/tasks/${task.id}$`));
  await expect(page.getByRole('status')).toHaveText('Cambios guardados.');
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Entregar la tarea 3 de TaskFlow' })).toBeVisible();
  await expect(page.locator('.task-description')).toContainText('Compartir el enlace');
  const saved = await request.get(`${API}/tasks/${task.id}`, { headers: { Authorization: `Bearer ${token}` } });
  expect((await saved.json()).data).toMatchObject({ title: 'Entregar la tarea 3 de TaskFlow', status: 'en_progreso', user_id: task.user_id });
  await page.screenshot({ path: 'docs/evidencia/sesion07/tarea3/detalle-desktop.png', fullPage: true });
  await page.getByRole('link', { name: 'Volver al tablero' }).click();
  await expect(page.getByRole('region', { name: 'En progreso', exact: true }).getByRole('article', { name: 'Entregar la tarea 3 de TaskFlow' })).toBeVisible();
  expect(errors).toEqual([]);
});

test('cancelar conserva datos y la descripción puede borrarse; edición móvil funcional', async ({ page, request }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(appUrl(`/tasks/${task.id}/edit`));
  await page.getByLabel('Título', { exact: true }).fill('No guardar este título');
  await page.getByLabel('Descripción', { exact: false }).fill('No guardar esta descripción');
  await page.getByRole('button', { name: 'Cancelar' }).click();
  await expect(page.getByRole('heading', { name: task.title })).toBeVisible();
  await expect(page.locator('.task-description')).toHaveText(task.description);
  await page.getByRole('link', { name: 'Editar tarea', exact: false }).click();
  await page.getByLabel('Descripción', { exact: false }).fill('');
  await page.getByLabel('Estado', { exact: true }).selectOption('completada');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: 'docs/evidencia/sesion07/tarea3/editar-movil.png', fullPage: true });
  await page.getByRole('button', { name: 'Guardar cambios' }).click();
  await expect(page).toHaveURL(new RegExp(`/tasks/${task.id}$`));
  await page.reload();
  await expect(page.locator('.task-description')).toHaveText('Esta tarea aún no tiene descripción.');
  const saved = await request.get(`${API}/tasks/${task.id}`, { headers: { Authorization: `Bearer ${token}` } });
  expect((await saved.json()).data).toMatchObject({ title: task.title, description: null, status: 'completada' });
});

test('validación y fallo de guardado conservan el formulario; reintento de carga', async ({ page, request }) => {
  await page.route(`**/api/tasks/${task.id}`, (route) => route.abort('failed'));
  await page.goto(appUrl(`/tasks/${task.id}/edit`));
  await expect(page.getByRole('alert')).toContainText('No pudimos conectar');
  await page.unroute(`**/api/tasks/${task.id}`);
  await page.getByRole('button', { name: 'Reintentar' }).click();
  await expect(page.getByLabel('Título', { exact: true })).toHaveValue(task.title);
  await page.getByLabel('Título', { exact: true }).fill('   ');
  await page.getByRole('button', { name: 'Guardar cambios' }).click();
  await expect(page.getByRole('alert')).toContainText('entre 1 y 255');
  await page.getByLabel('Título', { exact: true }).fill('Cambios conservados para reintentar');
  await page.route(`**/api/tasks/${task.id}`, (route) => route.abort('failed'));
  await page.getByRole('button', { name: 'Guardar cambios' }).click();
  await expect(page.getByRole('alert')).toContainText('No pudimos conectar');
  await expect(page.getByLabel('Título', { exact: true })).toHaveValue('Cambios conservados para reintentar');
  await expect(page.getByRole('button', { name: 'Guardar cambios' })).toBeEnabled();
  const unchanged = await request.get(`${API}/tasks/${task.id}`, { headers: { Authorization: `Bearer ${token}` } });
  expect((await unchanged.json()).data.title).toBe(task.title);
  await page.unroute(`**/api/tasks/${task.id}`);
  await page.getByRole('button', { name: 'Guardar cambios' }).click();
  await expect(page).toHaveURL(new RegExp(`/tasks/${task.id}$`));
  await expect(page.getByRole('heading', { name: 'Cambios conservados para reintentar' })).toBeVisible();
});

test('detalle y edición rechazan tareas ajenas, inexistentes y visitas sin sesión', async ({ page, request }) => {
  const registration = await request.post(`${API}/register`, { data: {
    name: 'Otra cuenta', email: `ajena.${Date.now()}@example.com`, password: 'password123',
  } });
  expect(registration.ok()).toBeTruthy();
  const otherToken = (await registration.json()).token;
  try {
    await page.evaluate((value) => localStorage.setItem('taskflow_token', value), otherToken);
    for (const path of [`/tasks/${task.id}`, `/tasks/${task.id}/edit`, '/tasks/999999999']) {
      await page.goto(appUrl(path));
      await expect(page.getByRole('heading', { name: 'Tarea no disponible' })).toBeVisible();
      await expect(page.getByRole('heading', { name: task.title })).toHaveCount(0);
      await expect(page.getByRole('button', { name: 'Guardar cambios' })).toHaveCount(0);
    }
    await page.evaluate(() => localStorage.removeItem('taskflow_token'));
    for (const path of [`/tasks/${task.id}`, `/tasks/${task.id}/edit`]) {
      await page.goto(appUrl(path));
      await expect(page).toHaveURL(/\/login$/);
    }
  } finally { await request.post(`${API}/logout`, { headers: { Authorization: `Bearer ${otherToken}` } }); }
});
