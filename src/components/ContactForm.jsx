// src/components/ContactForm.jsx
import React from 'react';
import './ContactForm.css';

/**
 * Componente de formulario de contacto.
 * Muestra un formulario estático para que los usuarios envíen mensajes.
 * Es un componente de presentación (presentational component) sin estado interno.
 * La lógica de envío (por ejemplo, a un backend) debería agregarse en el futuro.
 */
export default function ContactForm() {
  return (
    <section className="contact-section">
      {/* Capa de superposición para efectos visuales (ej. oscurecer fondo) */}
      <div className="overlay"></div>

      <div className="contact-content">
        <h2>Contáctanos</h2>
        <p>¿Tienes dudas o sugerencias? ¡Estamos para ayudarte!</p>

        {/* 
          Formulario de contacto.
          Actualmente solo maneja la interfaz; no tiene manejador de envío (onSubmit).
          Para integrar con un backend, se puede agregar un estado y una función handleSubmit.
        */}
        <form className="contact-form">
          <input type="text" placeholder="Tu nombre" required />
          <input type="email" placeholder="Tu correo" required />
          <textarea placeholder="Escribe tu mensaje..." rows="4" required></textarea>
          <button type="submit">Enviar mensaje</button>
        </form>
      </div>
    </section>
  );
}