const siguiente = { pendiente: 'en_progreso', en_progreso: 'completada' };
const etiquetas = { pendiente: 'Pendiente', en_progreso: 'En progreso', completada: 'Completada' };

export default function TaskCard({ id, title, status, busy, onCambiarEstado, onEliminar }) {
  return (
    <article className="task-card" aria-label={title} aria-busy={busy}>
      <div className="task-card-top"><span className={`badge ${status}`}>{etiquetas[status]}</span><span className="task-id">#{id}</span></div>
      <h3>{title}</h3>
      <div className="task-actions">
        {siguiente[status] ? <button className="advance-button" onClick={() => onCambiarEstado(id, siguiente[status])} disabled={busy}>Avanzar <span aria-hidden="true">→</span></button> : <span className="completed-label">✓ Completada</span>}
        <button onClick={() => onEliminar(id)} disabled={busy} className="btn-eliminar" aria-label={`Eliminar ${title}`} title="Eliminar tarea"><svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 10v7m4-7v7" /></svg></button>
      </div>
    </article>
  );
}
