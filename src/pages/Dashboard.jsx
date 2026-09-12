import Board from '../components/Board';
import WorkspaceLayout from '../components/WorkspaceLayout';

export default function Dashboard() {
  return (
    <WorkspaceLayout>
      <div className="page-heading"><span className="eyebrow">UN PASO MÁS CERCA</span><h1>Mi tablero</h1><p>Ordena tus pendientes. Visualiza tu progreso. Celebra lo que terminas.</p></div>
      <Board />
    </WorkspaceLayout>
  );
}
