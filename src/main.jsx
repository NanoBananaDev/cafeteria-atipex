// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './style.css';
import 'leaflet/dist/leaflet.css';

/**
 * Punto de entrada de la aplicación.
 * 
 * 1. Importa el componente principal `App`.
 * 2. Importa los estilos globales (style.css y leaflet.css para mapas).
 * 3. Renderiza la aplicación en el elemento con id "root" usando React 18+.
 * 
 * Se utiliza React.StrictMode para detectar posibles problemas en el desarrollo.
 */
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);