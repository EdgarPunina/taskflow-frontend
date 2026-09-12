import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { errorMessage } from '../services/api';
import { taskStatuses } from '../constants/taskStatus';

export default function TaskForm({ task }) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? '');
  const [status, setStatus] = useState(task.status);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const saving = useRef(false);
  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();
    if (saving.current) return;
    const trimmedTitle = title.trim();
    if (!trimmedTitle || trimmedTitle.length > 255) {
      setError('Escribe un título de entre 1 y 255 caracteres.');
      return;
    }
    saving.current = true;
    setBusy(true);
    setError('');
    try {
      await api.patch(`/tasks/${task.id}`, {
        title: trimmedTitle,
        description: description.trim() ? description : null,
        status,
      });
      navigate(`/tasks/${task.id}`, { replace: true, state: { saved: true } });
    } catch (failure) {
      setError(errorMessage(failure));
    } finally { saving.current = false; setBusy(false); }
  }

  return (
    <form className="task-form" onSubmit={handleSubmit} aria-busy={busy}>
      {error && <p className="error" role="alert">{error}</p>}
      <fieldset disabled={busy}>
        <label htmlFor="task-title">Título</label>
        <input id="task-title" value={title} onChange={(event) => setTitle(event.target.value)} required maxLength={255} autoFocus aria-describedby="title-hint" />
        <small id="title-hint">Un título claro, de hasta 255 caracteres.</small>
        <label htmlFor="task-description">Descripción <span>(opcional)</span></label>
        <textarea id="task-description" rows={7} value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Añade contexto, notas o los pasos para completar esta tarea." />
        <label htmlFor="task-status">Estado</label>
        <select id="task-status" value={status} onChange={(event) => setStatus(event.target.value)}>
          {taskStatuses.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
        </select>
        <div className="detail-actions">
          <button className="primary" type="submit">{busy ? 'Guardando…' : 'Guardar cambios'}</button>
          <button className="secondary" type="button" onClick={() => navigate(`/tasks/${task.id}`)}>Cancelar</button>
        </div>
      </fieldset>
    </form>
  );
}
