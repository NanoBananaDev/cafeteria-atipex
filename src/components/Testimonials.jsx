// src/components/Testimonials.jsx
import React from 'react';
import { motion } from 'framer-motion';

// ============================================================================
// 1. DATOS DE TESTIMONIOS (configuración)
// ============================================================================

/**
 * Lista de testimonios de clientes.
 * Cada objeto contiene texto, nombre, URL de la foto y calificación (1-5).
 */
const testimonials = [
  {
    texto: 'El mejor café que he probado, ambiente relajante.',
    nombre: 'Ana Torres',
    foto: 'https://randomuser.me/api/portraits/women/44.jpg',
    rating: 5,
  },
  {
    texto: 'Excelente atención y deliciosos postres. Volveré siempre.',
    nombre: 'Carlos Méndez',
    foto: 'https://randomuser.me/api/portraits/men/35.jpg',
    rating: 4,
  },
  {
    texto: 'Un rincón perfecto para trabajar o relajarse.',
    nombre: 'Lucía Fernández',
    foto: 'https://randomuser.me/api/portraits/women/68.jpg',
    rating: 5,
  },
];

// ============================================================================
// 2. SUBCOMPONENTE DE TARJETA DE TESTIMONIO
// ============================================================================

/**
 * Componente interno que renderiza una tarjeta de testimonio individual.
 * @param {Object} props
 * @param {string} props.texto - Texto del testimonio.
 * @param {string} props.nombre - Nombre del cliente.
 * @param {string} props.foto - URL de la foto de perfil.
 * @param {number} props.rating - Calificación (número de estrellas).
 * @param {number} props.delay - Retraso de animación en segundos.
 */
const TestimonioCard = ({ texto, nombre, foto, rating, delay }) => {
  // Genera la cadena de estrellas según el rating
  const estrellas = '⭐'.repeat(rating);

  return (
    <motion.div
      className="testimonial"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay }}
    >
      <img src={foto} alt={nombre} className="testimonial-foto" />
      <p className="testimonial-text">“{texto}”</p>
      <div className="testimonial-info">
        <strong>{nombre}</strong>
        <p className="testimonial-rating">{estrellas}</p>
      </div>
    </motion.div>
  );
};

// ============================================================================
// 3. COMPONENTE PRINCIPAL
// ============================================================================

/**
 * Componente que muestra una sección de testimonios de clientes.
 * Cada testimonio aparece con animación de entrada escalonada.
 * @returns {JSX.Element} Sección de testimonios.
 */
export default function Testimonials() {
  // Tiempo base de animación para cada tarjeta (se incrementa por índice)
  const BASE_DELAY = 0.5;

  return (
    <section className="section testimonials">
      {/* Encabezado con animación */}
      <motion.h2
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        Testimonios
      </motion.h2>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        Lo que dicen nuestros clientes:
      </motion.p>

      {/* Lista de tarjetas de testimonios */}
      <div className="testimonial-cards">
        {testimonials.map((item, index) => (
          <TestimonioCard
            key={index}
            texto={item.texto}
            nombre={item.nombre}
            foto={item.foto}
            rating={item.rating}
            delay={BASE_DELAY + index * 0.3}
          />
        ))}
      </div>
    </section>
  );
}