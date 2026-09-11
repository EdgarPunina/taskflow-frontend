import { useState, useEffect, useRef } from 'react';
import api, { errorMessage } from '../services/api';
import Column from './Column';

const columns = [{ status: 'pendiente', title: 'Pendiente' }, { status: 'en_progreso', title: 'En progreso' }, { status: 'completada', title: 'Completada' }];

export default function Board() {
  const [tasks, setTasks] = useState([]);
  const [nuevoTitulo, setNuevoTitulo] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [reload, setReload] = useState(0);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [busyIds, setBusyIds] = useState(new Set());
  const pending = useRef(new Set());
  const [creating, setCreating] = useState(false);
  const creatingRef = useRef(false);
  const input = useRef(null);

  useEffect(() => {
    const controller = new AbortController();
    api.get('/tasks', { signal: controller.signal }).then((response) => setTasks(response.data.data))
      .catch((failure) => {
        if (!controller.signal.aborted) { setError(errorMessage(failure)); setLoadFailed(true); }
      }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [reload]);

  async function agregarTarea(event) {
    event.preventDefault();
    if (creatingRef.current || loading || loadFailed) return;
    const title = nuevoTitulo.trim();
    if (!title) { setError('Escribe un título para tu tarea.'); return; }
    creatingRef.current = true;
    setCreating(true);
    setError('');
    try {
      const response = await api.post('/tasks', { title, status: 'pendiente' });
      setTasks((current) => [...current, response.data.data]);
      setNuevoTitulo('');
      setMessage('Tarea agregada.');
    } catch (failure) { setError(errorMessage(failure)); }
    finally { creatingRef.current = false; setCreating(false); input.current?.focus(); }
  }

  async function guardarCambio(id, nuevoEstado) {
    if (pending.current.has(id)) return;
    pending.current.add(id);
    setBusyIds(new Set(pending.current));
    setError('');
    try {
      if (nuevoEstado) {
        const response = await api.patch(`/tasks/${id}`, { status: nuevoEstado });
        setTasks((current) => current.map((task) => task.id === id ? response.data.data : task));
        setMessage('Estado actualizado.');
      } else {
        await api.delete(`/tasks/${id}`);
        setTasks((current) => current.filter((task) => task.id !== id));
        setMessage('Tarea eliminada.');
      }
    } catch (failure) { setError(errorMessage(failure)); }
    finally { pending.current.delete(id); setBusyIds(new Set(pending.current)); }
  }

  const completadas = tasks.filter((task) => task.status === 'completada').length;
  return (
    <div className="board">
      <div className="board-toolbar"><div><span className="view-icon" aria-hidden="true">▥</span><strong>Vista de tablero</strong><span className="total-count">{tasks.length} tareas</span></div><span className="progress-summary">{completadas} de {tasks.length} completadas</span></div>
      <form className="new-task" onSubmit={agregarTarea}>
        <label htmlFor="new-title" className="sr-only">Nueva tarea</label>
        <span aria-hidden="true">＋</span><input ref={input} id="new-title" value={nuevoTitulo} onChange={(e) => setNuevoTitulo(e.target.value)} maxLength={255} placeholder="¿Qué necesitas hacer? Escribe una nueva tarea…" disabled={creating || loading || loadFailed} />
        <button className="primary" disabled={creating || loading || loadFailed}>{creating ? 'Guardando…' : 'Agregar'}</button>
      </form>
      {error && <div className="error" role="alert">{error}{loadFailed && <button className="text-button" onClick={() => { setLoading(true); setLoadFailed(false); setError(''); setReload((value) => value + 1); }}>Reintentar</button>}</div>}
      <span className="sr-only" role="status">{loading ? 'Cargando tablero' : message}</span>
      <div className="columns">{columns.map((column) => <Column key={column.status} {...column} tasks={tasks.filter((task) => task.status === column.status)} busyIds={busyIds} onCambiarEstado={guardarCambio} onEliminar={(id) => guardarCambio(id)} loading={loading} />)}</div>
    </div>
  );
}
