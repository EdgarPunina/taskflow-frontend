import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import WorkspaceLayout from '../components/WorkspaceLayout';
import TaskForm from '../components/TaskForm';
import api, { errorMessage } from '../services/api';
import { statusLabel } from '../constants/taskStatus';

function TaskContent({ id, editing }) {
  const [task, setTask] = useState(null);
  const [failure, setFailure] = useState(null);
  const [attempt, setAttempt] = useState(0);
  const location = useLocation();

  useEffect(() => {
    const controller = new AbortController();
    api.get(`/tasks/${encodeURIComponent(id)}`, { signal: controller.signal })
      .then((response) => setTask(response.data.data))
      .catch((error) => {
        if (!controller.signal.aborted) setFailure({ notFound: error.response?.status === 404, message: errorMessage(error) });
      });
    return () => controller.abort();
  }, [id, attempt]);

  return (
    <WorkspaceLayout>
      <div className="task-detail">
        <Link className="back-link" to="/dashboard">← Volver al tablero</Link>
        <div className="page-heading"><span className="eyebrow">CADA PASO CUENTA</span><h1>{editing ? 'Editar tarea' : 'Detalle de la tarea'}</h1><p>{editing ? 'Ajusta los detalles y guarda tu próximo paso.' : 'Todo lo que necesitas para seguir avanzando.'}</p></div>
        {failure ? (
          <div className="detail-panel">
            <h2>{failure.notFound ? 'Tarea no disponible' : 'No pudimos cargar la tarea'}</h2>
            <p className="error" role="alert">{failure.notFound ? 'No encontramos esta tarea entre tus tareas. Puede que ya no exista o que no tengas acceso.' : failure.message}</p>
            {!failure.notFound && <button className="secondary" onClick={() => { setFailure(null); setAttempt((current) => current + 1); }}>Reintentar</button>}
          </div>
        ) : !task ? <p className="notice" role="status">Cargando tarea…</p> : (
          <section className="detail-panel" aria-label={editing ? 'Formulario de edición' : 'Información de la tarea'}>
            <div className="detail-meta"><span className={`badge ${task.status}`}>{statusLabel(task.status)}</span><span>Tarea #{task.id}</span></div>
            {editing ? <TaskForm task={task} /> : <>
              {location.state?.saved && <p className="notice" role="status">Cambios guardados.</p>}
              <h2 className="detail-title">{task.title}</h2>
              <dl className="task-information">
                <dt>Descripción</dt><dd className="task-description">{task.description || 'Esta tarea aún no tiene descripción.'}</dd>
                <dt>Estado</dt><dd>{statusLabel(task.status)}</dd>
                <dt>Creada el</dt><dd>{task.created_at}</dd>
              </dl>
              <div className="detail-actions"><Link className="primary" to={`/tasks/${task.id}/edit`}>Editar tarea <span aria-hidden="true">→</span></Link></div>
            </>}
          </section>
        )}
      </div>
    </WorkspaceLayout>
  );
}

export default function TaskDetail({ editing = false }) {
  const { id } = useParams();
  // Al cambiar de tarea o modo se descarta el formulario y cualquier respuesta anterior.
  return <TaskContent key={`${id}-${editing}`} id={id} editing={editing} />;
}
