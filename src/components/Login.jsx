import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import './Login.css';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default function Login({ onLoginSuccess }) {
  const [usuario, setUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const manejarLogin = async (e) => {
    e.preventDefault();
    setCargando(true);
    setError('');
    
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: usuario,
        password: contrasena
      });

      if (authError) throw authError;

      localStorage.setItem('usuario', JSON.stringify({
        email: data.user.email,
        id: data.user.id
      }));
      
      onLoginSuccess(data.user.email, 0);
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>☕ Bienvenido a Café Salud</h2>
        {error && <p className="error">{error}</p>}
        <form onSubmit={manejarLogin}>
          <input
            type="text"
            placeholder="Usuario"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
            required
          />
          <button type="submit" disabled={cargando}>
            {cargando ? 'Cargando...' : 'Ingresar'}
          </button>
        </form>
        <p className="slogan">Tu cuerpo merece un buen café y mejor atención.</p>
      </div>
    </div>
  );
}
