// src/components/PageLoader.jsx
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================================================
// 1. CONSTANTES (estilos en línea)
// ============================================================================

/** Estilos para la pantalla del loader (contenedor principal) */
const LOADER_STYLES = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  overflow: 'hidden',
  zIndex: 9999,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  fontFamily: 'Poppins, sans-serif',
  color: '#fff',
};

/** Estilos para el video de fondo */
const VIDEO_STYLES = {
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  zIndex: -1,
  filter: 'brightness(0.4)',
};

// ============================================================================
// 2. COMPONENTE PRINCIPAL
// ============================================================================

/**
 * Componente que muestra una pantalla de carga con video de fondo y animación.
 * Desaparece automáticamente después de 1.5 segundos.
 * @returns {JSX.Element | null} Pantalla de carga o null si ya terminó.
 */
export default function PageLoader() {
  const [isLoading, setIsLoading] = useState(true);

  // Efecto: oculta el loader después de 1500 ms
  useEffect(() => {
    const timeout = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          className="loader-screen"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          style={LOADER_STYLES}
        >
          {/* Video de fondo (reproduce automáticamente, en bucle, sin sonido) */}
          <video
            autoPlay
            muted
            loop
            playsInline
            className="video-background"
            style={VIDEO_STYLES}
          >
            <source src="/backround.mp4" type="video/mp4" />
            Tu navegador no soporta video.
          </video>

          {/* Texto animado que aparece con retraso */}
          <motion.h2
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Preparando tu café...
          </motion.h2>
        </motion.div>
      )}
    </AnimatePresence>
  );
}