// src/components/Header.jsx
import { Link } from 'react-router-dom';

// ============================================================================
// 1. CONFIGURACIÓN DE NAVEGACIÓN
// ============================================================================

/**
 * Datos de los enlaces de navegación.
 * Cada objeto define el texto a mostrar y la ruta (para react-router Link) 
 * o la URL (para enlaces con <a>).
 * 
 * Nota: Se utiliza "href" para enlaces que no usan react-router (como /reservas)
 * y "to" para enlaces internos con Link.
 */
const navLinks = [
  { label: 'Inicio', to: '/' },
  { label: 'Mesas', href: '/reservas' },
  
  { label: 'Productos', to: '/productos' },
];

// ============================================================================
// 2. COMPONENTE PRINCIPAL
// ============================================================================

/**
 * Componente de encabezado de la aplicación.
 * Muestra el logo, la barra de navegación y un botón para iniciar sesión.
 * @param {Object} props
 * @param {Function} props.onLoginClick - Callback que se ejecuta al hacer clic en el botón "Login".
 */
export default function Header({ onLoginClick }) {
  return (
    <header>
      {/* Logo de la cafetería */}
      <h1 className="logo">Cafetería</h1>

      {/* Barra de navegación con enlaces dinámicos */}
      <nav>
        {navLinks.map((link, index) => {
          // Si tiene "to", es un enlace interno con react-router
          if (link.to) {
            return (
              <Link key={index} to={link.to}>
                {link.label}
              </Link>
            );
          }
          // Si tiene "href", es un enlace externo o ancla
          return (
            <a key={index} href={link.href}>
              {link.label}
            </a>
          );
        })}
      </nav>

      {/* Botón de Login: dispara el callback recibido por props */}
      <button className="btn-signing" onClick={onLoginClick}>
        Login
      </button>
    </header>
  );
}