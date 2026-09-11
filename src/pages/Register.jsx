import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api, { TOKEN_KEY, errorMessage } from '../services/api';
import AuthLayout from '../components/AuthLayout';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();
    if (busy) return;
    if (!name.trim()) { setError('Escribe tu nombre.'); return; }
    setBusy(true);
    setError('');
    try {
      const response = await api.post('/register', { name: name.trim(), email: email.trim(), password });
      localStorage.setItem(TOKEN_KEY, response.data.token);
      navigate('/dashboard', { replace: true });
    } catch (failure) {
      setError(errorMessage(failure));
    } finally { setBusy(false); }
  }

  return (
    <AuthLayout>
      <span className="eyebrow">UN NUEVO COMIENZO</span>
      <h2>Haz espacio para tus ideas</h2>
      <p className="auth-subtitle">Crea tu cuenta y organiza tu primera tarea.</p>
      {error && <p className="error" role="alert">{error}</p>}
      <form onSubmit={handleSubmit}>
        <label htmlFor="name">Nombre</label>
        <input id="name" autoComplete="name" required maxLength={255} value={name} onChange={(e) => setName(e.target.value)} placeholder="¿Cómo te llamas?" disabled={busy} />
        <label htmlFor="email">Correo electrónico</label>
        <input id="email" type="email" autoComplete="email" required maxLength={255} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@correo.com" disabled={busy} />
        <label htmlFor="password">Contraseña</label>
        <input id="password" type="password" autoComplete="new-password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Al menos 8 caracteres" disabled={busy} aria-describedby="password-hint" />
        <small id="password-hint">Utiliza una contraseña de al menos 8 caracteres.</small>
        <button className="primary" disabled={busy}>{busy ? 'Creando cuenta…' : 'Crear cuenta'}<span aria-hidden="true">→</span></button>
      </form>
      <p className="auth-switch">¿Ya tienes cuenta? <Link to="/login">Iniciar sesión</Link></p>
    </AuthLayout>
  );
}
