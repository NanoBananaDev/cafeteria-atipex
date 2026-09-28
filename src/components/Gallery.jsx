// src/components/Gallery.jsx
import React, { useEffect, useState } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import './Gallery.css';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================================================
// 1. DATOS DE LA GALERÍA (configuración)
// ============================================================================

/** Lista de imágenes de la galería con su etiqueta descriptiva. */
const galleryImages = [
  { src: '/galeria1.jpg', label: 'Interior cafetería' },
  { src: '/galeria2.jpg', label: 'Bebida elegante' },
  { src: '/galeria3.jpg', label: 'Ambiente relajado' },
  { src: '/galeria4.jpg', label: 'Latte artístico' },
  { src: '/galeria5.jpg', label: 'Vista desde la terraza' },
  { src: '/galeria6.jpg', label: 'Clientes disfrutando' },
  { src: '/galeria7.jpg', label: 'Postre artesanal' },
  { src: '/galeria8.jpg', label: 'Decoración vintage' },
  { src: '/galeria9.jpg', label: 'La mejor atención' },
];

// ============================================================================
// 2. SUBCOMPONENTE DE LIGHTBOX (presentación)
// ============================================================================

/**
 * Componente interno que muestra la imagen en tamaño completo (lightbox).
 * Se renderiza cuando `selectedImage` no es null.
 * @param {Object} props
 * @param {Object} props.selectedImage - Objeto con { src, label } de la imagen seleccionada.
 * @param {Function} props.onClose - Función para cerrar el lightbox.
 */
const Lightbox = ({ selectedImage, onClose }) => {
  if (!selectedImage) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="lightbox"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        onClick={onClose} // Cerrar al hacer clic en el fondo
      >
        <motion.img
          src={selectedImage.src}
          alt={selectedImage.label}
          initial={{ scale: 0.7 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.7 }}
          transition={{ duration: 0.3 }}
        />
        <p>{selectedImage.label}</p>
      </motion.div>
    </AnimatePresence>
  );
};

// ============================================================================
// 3. COMPONENTE PRINCIPAL
// ============================================================================

/**
 * Componente de galería con lightbox y animaciones (AOS + Framer Motion).
 * Muestra una cuadrícula de imágenes que al hacer clic se amplían en un modal.
 * @returns {JSX.Element} Sección de galería.
 */
export default function Gallery() {
  const [selectedImage, setSelectedImage] = useState(null);

  // Inicializar AOS para animaciones al hacer scroll
  useEffect(() => {
    AOS.init({ duration: 1200 });
  }, []);

  /**
   * Maneja el clic en una imagen: abre el lightbox.
   * @param {Object} img - Objeto de la imagen seleccionada.
   */
  const handleImageClick = (img) => setSelectedImage(img);

  /**
   * Cierra el lightbox.
   */
  const handleCloseLightbox = () => setSelectedImage(null);

  return (
    <section className="section3 gallery-section">
      {/* Encabezado con animación de entrada */}
      <motion.h2
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        Galería
      </motion.h2>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
      >
        Un vistazo a la experiencia única de nuestra cafetería.
      </motion.p>

      {/* Cuadrícula de imágenes */}
      <div className="gallery advanced-grid">
        {galleryImages.map((img, index) => (
          <motion.div
            key={index}
            className="gallery-card"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 200 }}
            data-aos="zoom-in-up"
            data-aos-delay={index * 100}
            onClick={() => handleImageClick(img)}
          >
            <div className="card-img-wrapper">
              <img src={img.src} alt={img.label} className="gallery-image" />
              {/* Pie de foto que aparece al hacer hover */}
              <motion.div
                className="caption"
                initial={{ y: '100%' }}
                whileHover={{ y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {img.label}
              </motion.div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Lightbox (modal de imagen ampliada) */}
      <Lightbox selectedImage={selectedImage} onClose={handleCloseLightbox} />
    </section>
  );
}