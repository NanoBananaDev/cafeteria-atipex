// src/components/Carousel.jsx
import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';

/**
 * Datos de los elementos del carrusel.
 * Cada objeto contiene título, precio, descripción, imagen, color de fondo, etc.
 */
const items = [
  {
    title: 'Caffe Latte, a new product',
    price: 20,
    description: 'Espresso suave con leche vaporizada.',
    img: '/1.png',
    bg: '#5e2b1c',
    badge: 'Nuevo',
    rating: 4.5,
    features: ['Espresso 100% arábica', 'Leche vaporizada cremosa', 'Toques sutiles de cacao'],
    quote: 'Cada sorbo cuenta una historia.',
    sales: 'Más de 1200 vendidos esta semana',
  },
  {
    title: 'Strawberry mocha, a new product',
    price: 20,
    description: 'Chocolate, fresa y espresso.',
    img: '/2.png',
    bg: '#a77268',
    badge: 'Temporada',
    rating: 4.0,
    features: ['Base de espresso', 'Sabor a fresa natural', 'Toques de chocolate amargo'],
    quote: 'Sabor intenso con un toque dulce.',
    sales: 'Popular en jóvenes y verano',
  },
  {
    title: 'Doppio espresso, a new product',
    price: 20,
    description: 'Doble espresso intenso.',
    img: '/3.png',
    bg: '#0a0a0a',
    badge: 'Fuerte',
    rating: 5.0,
    features: ['Extra cafeína', 'Tueste italiano', 'Cuerpo robusto'],
    quote: 'Para los que aman el café sin filtros.',
    sales: 'Favorito de ejecutivos',
  },
  {
    title: 'Matcha latte macchiato, a new product',
    price: 20,
    description: 'Matcha japonés con leche.',
    img: '/4.png',
    bg: '#4c751f',
    badge: 'Popular',
    rating: 4.7,
    features: ['Matcha ceremonial', 'Leche cremosa', 'Antioxidantes naturales'],
    quote: 'Frescura verde en cada sorbo.',
    sales: 'Más pedido en temporada primavera',
  },
];

/**
 * Componente principal del carrusel.
 * Muestra los elementos en un slider automático con navegación manual.
 */
export default function Carousel() {
  const [active, setActive] = useState(1);
  const [direction, setDirection] = useState('next');
  const carouselRef = useRef(null);

  // ========== FUNCIONES DE NAVEGACIÓN ==========

  /** Avanza al siguiente slide. */
  const nextSlide = () => {
    setDirection('next');
    setActive((prev) => (prev + 1) % items.length);
  };

  /** Retrocede al slide anterior. */
  const prevSlide = () => {
    setDirection('prev');
    setActive((prev) => (prev - 1 + items.length) % items.length);
  };

  // ========== EFECTOS ==========

  /** Reproducción automática cada 7 segundos. */
  useEffect(() => {
    const interval = setInterval(nextSlide, 7000);
    return () => clearInterval(interval);
  }, []);

  /** Aplica la clase de dirección para animaciones CSS. */
  useEffect(() => {
    if (carouselRef.current) {
      carouselRef.current.classList.remove('next', 'prev');
      // Forzar reflow para reiniciar la animación
      void carouselRef.current.offsetWidth;
      carouselRef.current.classList.add(direction);
    }
  }, [active, direction]);

  // ========== FUNCIONES AUXILIARES ==========

  /**
   * Determina la clase CSS para un slide según su índice relativo al activo.
   * @param {number} index - Índice del slide.
   * @returns {string} Clases CSS para el contenedor.
   */
  const getClass = (index) => {
    if (index === active) return 'item active';
    if (index === (active - 1 + items.length) % items.length) return 'item other_1';
    if (index === (active + 1) % items.length) return 'item other_2';
    return 'item';
  };

  /**
   * Genera la representación visual de la puntuación con estrellas.
   * @param {number} rating - Puntuación (ej. 4.5).
   * @returns {string} Cadena con estrellas y media estrella si aplica.
   */
  const renderRating = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalf = rating % 1 >= 0.5;
    return '⭐'.repeat(fullStars) + (hasHalf ? '½' : '');
  };

  // ========== RENDERIZADO ==========

  return (
    <section className="carousel" ref={carouselRef}>
      <div className="list">
        {items.map((item, index) => (
          <article className={getClass(index)} key={index}>
            <div className="main-content" style={{ backgroundColor: item.bg }}>
              <div className="content">
                <span className="badge">{item.badge}</span>
                <h2>{item.title}</h2>
                <p className="price">Bs{item.price}</p>
                <p className="description"><em>{item.description}</em></p>
                <p className="review">{renderRating(item.rating)}</p>
                <ul className="features">
                  {item.features.map((f, i) => <li key={i}>🍃 {f}</li>)}
                </ul>
                <p className="slogan">“{item.quote}”</p>
                <p className="sales">🔥 {item.sales}</p>
                <motion.button
                  className="addToCard"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Add To Cart
                </motion.button>
              </div>
            </div>
            <figure className="image">
              <img src={item.img} alt={item.title} />
              <figcaption>{item.title}</figcaption>
            </figure>
          </article>
        ))}
      </div>

      <div className="arrows">
        <button onClick={prevSlide}>&lt;</button>
        <button onClick={nextSlide}>&gt;</button>
      </div>

      <div className="indicators">
        {items.map((_, i) => (
          <span key={i} className={i === active ? 'dot active' : 'dot'}></span>
        ))}
      </div>
    </section>
  );
}