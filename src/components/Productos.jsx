// src/components/Productos.jsx
import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

// ============================================================================
// 1. CONFIGURACIÓN DE SUPABASE
// ============================================================================

/**
 * Cliente de Supabase inicializado con variables de entorno.
 * @type {import('@supabase/supabase-js').SupabaseClient}
 */
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// ============================================================================
// 2. FUNCIONES AUXILIARES (lógica de negocio y utilidades)
// ============================================================================

/**
 * Obtiene los productos activos con stock > 0 desde Supabase.
 * Selecciona solo los campos necesarios: id, nombre, precio, imagen_url.
 * @returns {Promise<Array>} Lista de productos.
 * @throws {Error} Si la consulta falla.
 */
const obtenerProductos = async () => {
  const { data, error } = await supabase
    .from('productos')
    .select('id, nombre, precio, imagen_url')
    .eq('activo', true)
    .gt('stock', 0);

  if (error) throw new Error(`Error al obtener productos: ${error.message}`);
  return data || [];
};

// ============================================================================
// 3. COMPONENTE PRINCIPAL
// ============================================================================

/**
 * Componente que muestra una lista de productos en forma de tarjetas.
 * Obtiene los datos de Supabase al montarse y los renderiza en una cuadrícula.
 * @returns {JSX.Element} Sección de productos.
 */
const Productos = () => {
  const [productos, setProductos] = useState([]);

  // Cargar productos al montar el componente
  useEffect(() => {
    const cargarProductos = async () => {
      try {
        const data = await obtenerProductos();
        setProductos(data);
      } catch (err) {
        console.error('Error al obtener productos:', err);
      }
    };
    cargarProductos();
  }, []);

  // ==========================================================================
  // RENDERIZADO
  // ==========================================================================

  // Estilos en línea (se mantienen igual que en el original, pero separados para claridad)
  const containerStyle = { padding: '2rem' };
  const gridStyle = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '1rem',
  };
  const cardStyle = {
    border: '1px solid #ccc',
    borderRadius: '8px',
    padding: '1rem',
    width: '200px',
  };
  const imageStyle = {
    width: '100%',
    height: '150px',
    objectFit: 'cover',
  };

  return (
    <div style={containerStyle}>
      <h2>Lista de Productos</h2>
      <div style={gridStyle}>
        {productos.map((prod) => (
          <div key={prod.id} style={cardStyle}>
            <img
              src={prod.imagen_url || '/default-product.png'}
              alt={prod.nombre}
              style={imageStyle}
            />
            <h4>{prod.nombre}</h4>
            <p>
              <strong>Bs. {Number(prod.precio || 0).toFixed(2)}</strong>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Productos;