// src/components/MapSection.jsx
import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// ============================================================================
// 1. CONFIGURACIÓN DE LEAFLET (estilos y marcador)
// ============================================================================

/**
 * Configura el icono por defecto de Leaflet para evitar que el marcador se vea
 * como un recuadro roto cuando se usa con Vite/Webpack.
 * 
 * Se crea un icono personalizado con la imagen del marcador y su sombra,
 * y se asigna como opción por defecto para todos los marcadores.
 */
const configurarIconoLeaflet = () => {
  const DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });
  L.Marker.prototype.options.icon = DefaultIcon;
};

// Ejecutar la configuración al cargar el módulo (solo una vez)
configurarIconoLeaflet();

// ============================================================================
// 2. CONSTANTES DE ESTILOS (Separación de Concerns)
// ============================================================================

/**
 * Estilos en línea para la sección del mapa.
 * Se extraen a constantes para mantener el JSX limpio y facilitar futuros cambios.
 */
const SECTION_STYLES = {
  height: '400px',
  width: '100%',
  margin: '2rem 0',
};

const TITLE_STYLES = {
  textAlign: 'center',
  marginBottom: '1rem',
};

const MAP_STYLES = {
  height: '100%',
  width: '100%',
  borderRadius: '8px',
};

// ============================================================================
// 3. COMPONENTE PRINCIPAL
// ============================================================================

/**
 * Componente que muestra un mapa interactivo con la ubicación de la cafetería.
 * Utiliza React Leaflet para renderizar el mapa, un marcador y un popup con información.
 * 
 * @returns {JSX.Element} Sección del mapa.
 */
export default function MapSection() {
  // Coordenadas de la cafetería (Cochabamba, Bolivia)
  const position = [-17.3895, -66.1568];

  return (
    <section className="map-section" style={SECTION_STYLES}>
      <h2 style={TITLE_STYLES}>📍 Nuestra Ubicación</h2>
      <MapContainer
        center={position}
        zoom={15}
        style={MAP_STYLES}
      >
        {/* Capa de mapas base (OpenStreetMap) */}
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {/* Marcador con popup informativo */}
        <Marker position={position}>
          <Popup>
            <strong>☕ Cafetería Aroma</strong>
            <br />
            ¡Ven a visitarnos!
          </Popup>
        </Marker>
      </MapContainer>
    </section>
  );
}