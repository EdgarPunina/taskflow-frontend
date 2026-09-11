import { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import api, { TOKEN_KEY, errorMessage } from '../services/api';
import AuthLayout from '../components/AuthLayout';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const [params] = useSearchParams();

  async function handleSubmit(event) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      const response = await api.post('/login', { email: email.trim(), password });
      localStorage.setItem(TOKEN_KEY, response.data.token);
      navigate('/dashboard', { replace: true });
    } catch (failure) {
      setError(errorMessage(failure));
    } finally { setBusy(false); }
  }

  return (
    <AuthLayout>
      <span className="eyebrow">TU ESPACIO DE TRABAJO</span>
      <h2>Qué bueno verte de nuevo</h2>
      <p className="auth-subtitle">Inicia sesión para continuar donde lo dejaste.</p>
      {params.get('session') === 'expired' && <p className="notice" role="status">Tu sesión terminó. Inicia sesión nuevamente.</p>}
      {error && <p className="error" role="alert">{error}</p>}
      <form onSubmit={handleSubmit}>
        <label htmlFor="email">Correo electrónico</label>
        <input id="email" type="email" autoComplete="email" required maxLength={255} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@correo.com" disabled={busy} />
        <label htmlFor="password">Contraseña</label>
        <input id="password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Tu contraseña" disabled={busy} />
        <button className="primary" disabled={busy}>{busy ? 'Iniciando sesión…' : 'Entrar'}<span aria-hidden="true">→</span></button>
      </form>
      <p className="auth-switch">¿No tienes cuenta? <Link to="/register">Crear cuenta</Link></p>
    </AuthLayout>
  );
}
