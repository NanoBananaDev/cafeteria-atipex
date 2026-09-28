// src/components/Footer.jsx
import React from 'react';
import './Footer.css';

/**
 * Datos de los enlaces de redes sociales y contacto.
 * Cada objeto contiene la URL, el ícono (clase Font Awesome) y el label aria.
 * Esta estructura facilita agregar o modificar enlaces sin duplicar JSX.
 */
const socialLinks = [
  {
    href: 'https://www.instagram.com',
    icon: 'fab fa-instagram',
    label: 'Instagram',
  },
  {
    href: 'https://www.facebook.com',
    icon: 'fab fa-facebook-f',
    label: 'Facebook',
  },
  {
    href: 'https://wa.me/59171234567',
    icon: 'fab fa-whatsapp',
    label: 'WhatsApp',
  },
  {
    href: 'https://www.google.com/maps/place/Cafetería+Aroma',
    icon: 'fas fa-map-marker-alt',
    label: 'Ubicación',
  },
];

/**
 * Componente Footer.
 * Muestra el pie de página con el copyright y enlaces a redes sociales.
 * Es un componente de presentación puro.
 */
export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        {/* Año dinámico para mantenerlo actualizado automáticamente */}
        <p>&copy; {new Date().getFullYear()} Cafetería Aroma. Todos los derechos reservados.</p>
        <div className="social-icons">
          {socialLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noreferrer"
              aria-label={link.label}
            >
              <i className={link.icon}></i>
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}