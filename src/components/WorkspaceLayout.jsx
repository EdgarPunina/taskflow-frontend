import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Brand from './Brand';
import api, { TOKEN_KEY, errorMessage } from '../services/api';

export default function WorkspaceLayout({ children }) {
  const [user, setUser] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const controller = new AbortController();
    api.get('/user', { signal: controller.signal }).then((response) => setUser(response.data))
      .catch((failure) => { if (!controller.signal.aborted) setError(errorMessage(failure)); });
    return () => controller.abort();
  }, []);

  async function logout() {
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      await api.post('/logout');
      localStorage.removeItem(TOKEN_KEY);
      navigate('/login', { replace: true });
    } catch (failure) { setError(errorMessage(failure)); }
    finally { setBusy(false); }
  }

  return (
    <div className="workspace">
      <header className="topbar">
        <Brand /><span className="workspace-label">Mi espacio de trabajo</span>
        <div className="account"><span className="avatar" aria-hidden="true">{user?.name?.slice(0, 1).toUpperCase() || 'T'}</span><span className="account-name">{user?.name || 'Mi cuenta'}</span><button className="text-button" onClick={logout} disabled={busy}>{busy ? 'Cerrando…' : 'Cerrar sesión'}</button></div>
      </header>
      <main className="dashboard">
        {error && <p className="error" role="alert">{error}</p>}
        {children}
      </main>
      <footer className="workspace-footer">TaskFlow <span>Un poco de orden, un gran avance.</span></footer>
    </div>
  );
}
