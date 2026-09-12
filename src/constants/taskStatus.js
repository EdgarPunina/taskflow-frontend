export const taskStatuses = [
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'en_progreso', label: 'En progreso' },
  { value: 'completada', label: 'Completada' },
];

export function statusLabel(status) {
  return taskStatuses.find((item) => item.value === status)?.label || status;
}
