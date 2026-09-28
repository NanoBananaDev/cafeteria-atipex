// src/components/MenuAccordion.jsx
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import './MenuAccordion.css';

// ============================================================================
// 1. CONFIGURACIÓN DE SUPABASE
// ============================================================================

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// ============================================================================
// 2. FUNCIONES AUXILIARES
// ============================================================================

const obtenerProductos = async () => {
  const { data, error } = await supabase
    .from('productos')
    .select('id, nombre, descripcion, precio, stock, imagen_url, categoria_id, categorias(nombre)')
    .eq('activo', true)
    .gt('stock', 0);
  if (error) throw new Error(`Error al cargar productos: ${error.message}`);
  return data || [];
};

const agruparPorCategoria = (productos) => {
  return productos.reduce((acc, prod) => {
    const nombreCategoria = prod.categorias?.nombre || 'Otros';
    if (!acc[nombreCategoria]) acc[nombreCategoria] = [];
    acc[nombreCategoria].push(prod);
    return acc;
  }, {});
};

// ============================================================================
// 3. SUBCOMPONENTE ProductItem (memoizado)
// ============================================================================

const ProductItem = React.memo(({ item, agregarAlCarrito }) => {
  // Imagen con tamaño reducido
  const imgUrl = item.imagen_url
    ? `${item.imagen_url}?width=120&height=120&fit=crop`
    : '/default-product.png';

  return (
    <li className="menu-item">
      <img
        src={imgUrl}
        alt={item.nombre}
        className="menu-img"
        loading="lazy"
        decoding="async"
        style={{ width: '80px', height: '80px', objectFit: 'cover' }}
      />
      <div>
        <strong>{item.nombre}</strong>
        <p>Precio: Bs. {Number(item.precio || 0).toFixed(2)}</p>
        <button
          className="btn-pedir"
          onClick={() =>
            agregarAlCarrito({
              nombre: item.nombre,
              precio: Number(item.precio || 0),
              id: item.id,
            })
          }
        >
          Pedir
        </button>
      </div>
    </li>
  );
});

// ============================================================================
// 4. COMPONENTE DE LISTA CON CARGA POR LOTES (sin librerías externas)
// ============================================================================

const LazyList = ({ items, agregarAlCarrito, batchSize = 20 }) => {
  const [visibleCount, setVisibleCount] = useState(batchSize);
  const containerRef = useRef(null);
  const observerRef = useRef(null);

  // Cargar más items cuando se hace scroll al final
  const loadMore = useCallback(() => {
    setVisibleCount((prev) => Math.min(prev + batchSize, items.length));
  }, [items.length, batchSize]);

  // Intersection Observer para detectar el final de la lista
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && visibleCount < items.length) {
          loadMore();
        }
      },
      { threshold: 0.1, rootMargin: '20px' }
    );

    // Observar el último elemento de la lista
    const lastItem = containerRef.current.lastElementChild;
    if (lastItem) {
      observer.observe(lastItem);
    }

    observerRef.current = observer;
    return () => observer.disconnect();
  }, [visibleCount, items.length, loadMore]);

  // Resetear visibleCount cuando cambian los items (nueva categoría)
  useEffect(() => {
    setVisibleCount(batchSize);
  }, [items, batchSize]);

  const visibleItems = items.slice(0, visibleCount);
  const hasMore = visibleCount < items.length;

  return (
    <div ref={containerRef}>
      <ul className="menu-items" style={{ maxHeight: '500px', overflowY: 'auto' }}>
        {visibleItems.map((item, index) => (
          <ProductItem key={index} item={item} agregarAlCarrito={agregarAlCarrito} />
        ))}
      </ul>
      {hasMore && (
        <div style={{ textAlign: 'center', padding: '8px', color: '#666', fontSize: '0.9rem' }}>
          ⚡ Mostrando {visibleCount} de {items.length} productos
          <br />
          <button
            onClick={loadMore}
            style={{
              marginTop: '5px',
              padding: '5px 15px',
              background: '#27ae60',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Cargar más
          </button>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// 5. COMPONENTE PRINCIPAL
// ============================================================================

export default function MenuAccordion({ agregarAlCarrito }) {
  const [productos, setProductos] = useState([]);
  const [activeIndex, setActiveIndex] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cargarProductos = async () => {
      try {
        const data = await obtenerProductos();
        setProductos(data);
      } catch (err) {
        setError('Error al cargar productos');
        console.error(err);
      }
    };
    cargarProductos();
  }, []);

  const productosPorCategoria = useMemo(
    () => agruparPorCategoria(productos),
    [productos]
  );

  const toggleSection = useCallback((index) => {
    setActiveIndex((prev) => (prev === index ? null : index));
  }, []);

  if (error) return <div className="error-message">{error}</div>;

  return (
    <section className="menu-accordion">
      <h2 className="menu-title">Nuestro Menú</h2>
      {Object.entries(productosPorCategoria).map(([categoria, items], i) => (
        <div className="menu-section" key={i}>
          <button className="menu-toggle" onClick={() => toggleSection(i)}>
            {categoria} <span>{activeIndex === i ? '▲' : '▼'}</span>
          </button>

          {activeIndex === i && (
            <LazyList
              items={items}
              agregarAlCarrito={agregarAlCarrito}
              batchSize={20}
            />
          )}
        </div>
      ))}
    </section>
  );
}