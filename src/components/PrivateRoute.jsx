import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { TOKEN_KEY } from '../services/api';

export default function PrivateRoute({ children }) {
  const token = localStorage.getItem(TOKEN_KEY);
  useEffect(() => {
    const changed = (event) => {
      if (event.key === TOKEN_KEY || event.key === null) {
        // Recargar también al cambiar de cuenta evita mostrar datos del usuario anterior.
        window.location.reload();
      }
    };
    window.addEventListener('storage', changed);
    return () => window.removeEventListener('storage', changed);
  }, []);
  return token ? children : <Navigate to="/login" replace />;
}
