// src/components/FormularioCompra.jsx
import React, { useState } from 'react';

// ============================================================================
// 1. CONSTANTES (configuración)
// ============================================================================

/** URL base de la API del backend. */
const API_BASE_URL = 'http://localhost:5000/api';

// ============================================================================
// 2. FUNCIONES AUXILIARES (lógica de negocio y utilidades)
// ============================================================================

/**
 * Calcula el total del carrito sumando Precio * cantidad de cada producto.
 * @param {Array} carrito - Lista de productos con { Precio, cantidad }.
 * @returns {number} Total acumulado.
 */
const calcularTotal = (carrito) =>
  carrito.reduce((acc, prod) => acc + prod.Precio * prod.cantidad, 0);

/**
 * Valida los datos del cliente y el pago antes de enviar la compra.
 * @param {Object} cliente - Objeto con nombre, ci, correo.
 * @param {number} pago - Monto entregado.
 * @param {number} total - Total a pagar.
 * @returns {Object} { valido: boolean, mensaje: string } - Resultado de la validación.
 */
const validarCompra = (cliente, pago, total) => {
  if (!cliente.nombre || !cliente.ci || !cliente.correo || !pago) {
    return { valido: false, mensaje: 'Por favor, llena todos los campos obligatorios.' };
  }
  if (pago < total) {
    return { 
      valido: false, 
      mensaje: `El pago debe ser mayor o igual al total. Total: Bs. ${total.toFixed(2)}` 
    };
  }
  return { valido: true, mensaje: '' };
};

/**
 * Envía los datos de la venta al backend.
 * @param {number} total - Total de la venta.
 * @param {number} pago - Monto pagado.
 * @param {number} cambio - Cambio calculado.
 * @returns {Promise<Object>} Respuesta del servidor (objeto JSON).
 * @throws {Error} Si la respuesta no es exitosa o hay error de red.
 */
const registrarVenta = async (total, pago, cambio) => {
  const res = await fetch(`${API_BASE_URL}/ventas`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ total, pago, cambio }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.mensaje || 'Error al registrar la venta');
  }
  return data;
};

// ============================================================================
// 3. COMPONENTE PRINCIPAL
// ============================================================================

/**
 * Formulario de compra que solicita datos del cliente y el pago,
 * valida y registra la venta en el backend.
 * @param {Object} props
 * @param {Array} props.carrito - Lista de productos en el carrito.
 * @param {Function} props.onConfirmar - Callback que se ejecuta al confirmar la compra (recibe los datos del cliente).
 */
export default function FormularioCompra({ carrito, onConfirmar }) {
  // Estado del formulario
  const [cliente, setCliente] = useState({
    nombre: '',
    ci: '',
    correo: '',
    direccion: '',
  });
  const [pago, setPago] = useState('');
  const [mensaje, setMensaje] = useState('');

  // Cálculos derivados
  const total = calcularTotal(carrito);
  const cambio = pago && !isNaN(pago) && pago >= total ? pago - total : 0;

  /**
   * Maneja el cambio en los campos de entrada del cliente.
   * @param {Event} e - Evento del input.
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setCliente((prev) => ({ ...prev, [name]: value }));
  };

  /**
   * Maneja el envío del formulario.
   * Valida, envía al backend y maneja la respuesta.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    const pagoNum = parseFloat(pago);
    // Validar datos
    const validacion = validarCompra(cliente, pagoNum, total);
    if (!validacion.valido) {
      alert(validacion.mensaje);
      return;
    }

    try {
      const data = await registrarVenta(total, pagoNum, cambio);
      setMensaje('✅ Compra registrada exitosamente.');
      onConfirmar(cliente); // Callback para acciones posteriores (ej. factura)
    } catch (err) {
      alert(`❌ Error: ${err.message}`);
      console.error('Error en la venta:', err);
    }
  };

  // ==========================================================================
  // RENDERIZADO
  // ==========================================================================

  return (
    <div style={{ padding: '1rem', border: '1px solid #ccc', margin: '1rem' }}>
      <h2>🧾 Datos del Cliente</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="nombre"
          placeholder="Nombre completo"
          value={cliente.nombre}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="ci"
          placeholder="Cédula de Identidad"
          value={cliente.ci}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="correo"
          placeholder="Correo electrónico"
          value={cliente.correo}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="direccion"
          placeholder="Dirección"
          value={cliente.direccion}
          onChange={handleChange}
        />

        <p>Total a pagar: <strong>Bs. {total.toFixed(2)}</strong></p>

        <input
          type="number"
          name="pago"
          placeholder="Monto entregado"
          value={pago}
          onChange={(e) => setPago(e.target.value)}
          required
        />

        {pago && !isNaN(pago) && pago >= total && (
          <p>Cambio: <strong>Bs. {cambio.toFixed(2)}</strong></p>
        )}

        <button type="submit">Finalizar Compra</button>
      </form>

      {mensaje && <p style={{ color: 'green' }}>{mensaje}</p>}
    </div>
  );
}