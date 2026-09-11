import TaskCard from './TaskCard';

export default function Column({ title, status, tasks, busyIds, onCambiarEstado, onEliminar, loading }) {
  return (
    <section className={`column ${status}`} aria-label={title}>
      <header className="column-heading"><h2><span className="column-dot" />{title}</h2><span className="count" aria-label={`${tasks.length} tareas`}>{tasks.length}</span></header>
      {tasks.map((task) => <TaskCard key={task.id} {...task} busy={busyIds.has(task.id)} onCambiarEstado={onCambiarEstado} onEliminar={onEliminar} />)}
      {!tasks.length && <div className="empty-column"><span aria-hidden="true">{status === 'completada' ? '✓' : '＋'}</span><p>{loading ? 'Cargando tareas…' : 'Sin tareas por aquí'}</p><small>{status === 'pendiente' ? 'Las nuevas ideas empiezan aquí.' : status === 'en_progreso' ? 'Dale el siguiente paso a una tarea.' : 'Cada tarea terminada cuenta.'}</small></div>}
    </section>
  );
}
