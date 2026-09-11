import Brand from './Brand';

export default function AuthLayout({ children }) {
  return (
    <main className="auth-layout">
      <aside className="auth-story">
        <Brand />
        <div className="story-content">
          <span className="eyebrow">MENOS RUIDO. MÁS CLARIDAD.</span>
          <h1>Una tarea a la vez.<br /><span>Todo en su lugar.</span></h1>
          <p>De la primera idea al último pendiente. Encuentra tu ritmo y dale espacio a lo que importa.</p>
          <div className="flow-illustration" aria-hidden="true">
            <div><span className="flow-dot pending" />Por hacer<i /><i /></div>
            <div><span className="flow-dot progress" />En marcha<i /><i /></div>
            <div><span className="flow-dot done" />Hecho<i /><span className="flow-check">✓</span></div>
          </div>
        </div>
        <p className="story-footer">Tu espacio para convertir planes en avances.</p>
      </aside>
      <section className="auth-panel"><div className="auth-card">{children}</div></section>
    </main>
  );
}
