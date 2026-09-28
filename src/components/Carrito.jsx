// src/components/Carrito.jsx
import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import './Carrito.css';

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
 * Calcula el total del carrito sumando precio * cantidad de cada ítem.
 * @param {Array} carrito - Lista de productos con { precio, cantidad }.
 * @returns {number} Total acumulado.
 */
const calcularTotal = (carrito) =>
  carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0);

/**
 * Registra una venta en Supabase (crea pedido, detalles, pago).
 * @param {Array} carrito - Productos del carrito.
 * @param {number} total - Total calculado.
 * @param {number} montoPagado - Monto con el que se paga.
 * @returns {Promise<Object>} Objeto con { factura, cambio } o lanza error.
 */
const registrarVentaEnSupabase = async (carrito, total, montoPagado) => {
  // 1. Obtener o crear cliente (genérico o autenticado)
  let clienteId = null;
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    const { data: cliente } = await supabase
      .from('clientes')
      .select('id')
      .eq('usuario_id', user.id)
      .single();
    clienteId = cliente?.id;
  }
  if (!clienteId) clienteId = 1; // Cliente mostrador por defecto

  // 2. Crear pedido
  const { data: pedidoData, error: pedidoError } = await supabase
    .from('pedidos')
    .insert([{
      cliente_id: clienteId,
      origen: 'web',
      tipo_entrega: 'local',
      estado: 'pendiente',
      subtotal: total,
      costo_envio: 0,
      total: total,
    }])
    .select('*')
    .single();

  if (pedidoError) throw new Error(`Error al crear pedido: ${pedidoError.message}`);
  const pedidoId = pedidoData.id;

  // 3. Insertar detalles del pedido
  const detalles = carrito.map((item) => ({
    pedido_id: pedidoId,
    producto_id: item.id,
    cantidad: item.cantidad,
    precio_unitario: item.precio,
    subtotal: item.precio * item.cantidad,
  }));

  const { error: detallesError } = await supabase
    .from('detalle_pedidos')
    .insert(detalles);
  if (detallesError) throw new Error(`Error al insertar detalles: ${detallesError.message}`);

  // 4. Registrar pago
  const { error: pagoError } = await supabase
    .from('pagos')
    .insert([{
      pedido_id: pedidoId,
      metodo: 'efectivo',
      monto: montoPagado,
      estado: 'pagado',
    }]);
  if (pagoError) throw new Error(`Error al registrar pago: ${pagoError.message}`);

  // 5. Generar datos de factura
  const numeroFactura = `FCT-${pedidoId}-${Date.now()}`;
  const fechaHora = new Date().toLocaleString('es-ES');
  const cambio = montoPagado - total;

  const factura = {
    numero: numeroFactura,
    fecha: fechaHora,
    items: carrito,
    subtotal: total,
    descuento: 0,
    total: total,
    pagado: montoPagado,
    cambio: cambio,
    metodo: 'Efectivo',
  };

  return { factura, cambio };
};

// ============================================================================
// 3. COMPONENTE DE FACTURA (renderizado)
// ============================================================================

/**
 * Componente interno para mostrar la factura después de la compra.
 * @param {Object} factura - Datos de la factura.
 * @param {Function} onCerrar - Función para cerrar la factura.
 */
const Factura = ({ factura, onCerrar }) => (
  <div style={{ fontSize: '12px', fontFamily: 'monospace', border: '1px solid #333', padding: '15px', borderRadius: '5px', backgroundColor: '#f9f9f9' }}>
    {/* Encabezado */}
    <div style={{ textAlign: 'center', borderBottom: '2px solid #333', paddingBottom: '10px', marginBottom: '10px' }}>
      <h4 style={{ margin: '0 0 5px 0' }}>🧾 FACTURA DE VENTA</h4>
      <p style={{ margin: '2px 0' }}><strong>{factura.numero}</strong></p>
      <p style={{ margin: '2px 0', fontSize: '10px' }}>{factura.fecha}</p>
    </div>

    {/* Detalles de productos */}
    <div style={{ marginBottom: '10px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 0.8fr 1fr 1fr', gap: '5px', fontWeight: 'bold', marginBottom: '5px', borderBottom: '1px solid #ddd', paddingBottom: '5px' }}>
        <span>Producto</span>
        <span>Cant.</span>
        <span>Precio</span>
        <span>Subtotal</span>
      </div>
      {factura.items.map((item, i) => (
        <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 0.8fr 1fr 1fr', gap: '5px', paddingBottom: '3px' }}>
          <span>{item.nombre}</span>
          <span>{item.cantidad}</span>
          <span>Bs {item.precio.toFixed(2)}</span>
          <span>Bs {(item.precio * item.cantidad).toFixed(2)}</span>
        </div>
      ))}
    </div>

    {/* Totales */}
    <div style={{ borderTop: '2px solid #333', paddingTop: '10px', marginTop: '10px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
        <span>SUBTOTAL:</span>
        <span>Bs {factura.subtotal.toFixed(2)}</span>
      </div>
      {factura.descuento > 0 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', color: '#27ae60' }}>
          <span>DESCUENTO:</span>
          <span>-Bs {factura.descuento.toFixed(2)}</span>
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>
        <span>TOTAL:</span>
        <span>Bs {factura.total.toFixed(2)}</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
        <span>PAGADO:</span>
        <span>Bs {factura.pagado.toFixed(2)}</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', color: '#27ae60', borderTop: '1px solid #ddd', paddingTop: '5px' }}>
        <span>CAMBIO:</span>
        <span>Bs {factura.cambio.toFixed(2)}</span>
      </div>
    </div>

    {/* Método de pago */}
    <div style={{ textAlign: 'center', marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #ddd', fontSize: '11px' }}>
      <p style={{ margin: '3px 0' }}>Método: {factura.metodo}</p>
      <p style={{ margin: '3px 0' }}>✅ PAGO REALIZADO</p>
    </div>

    {/* Pie */}
    <div style={{ textAlign: 'center', marginTop: '10px', fontSize: '10px', color: '#666' }}>
      <p>¡Gracias por su compra!</p>
      <p>Vuelva pronto</p>
    </div>

    {/* Botones */}
    <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
      <button onClick={() => window.print()} style={{ flex: 1, padding: '8px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
        🖨️ Imprimir
      </button>
      <button onClick={onCerrar} style={{ flex: 1, padding: '8px', backgroundColor: '#27ae60', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
        ✅ Cerrar
      </button>
    </div>
  </div>
);

// ============================================================================
// 4. COMPONENTE PRINCIPAL CARRITO
// ============================================================================

/**
 * Componente que muestra el carrito de compras, maneja el pago y la facturación.
 * @param {Object} props
 * @param {Array} props.carrito - Lista de productos en el carrito.
 * @param {Function} props.eliminarDelCarrito - Función para eliminar un ítem por índice.
 * @param {Function} props.setCarrito - Función para actualizar el carrito.
 * @param {boolean} props.visible - Indica si el menú del carrito está visible.
 * @param {Function} props.setVisible - Función para cambiar la visibilidad.
 */
export default function Carrito({ carrito = [], eliminarDelCarrito, setCarrito, visible, setVisible }) {
  // Estados del componente
  const [modoPago, setModoPago] = useState(false);
  const [pago, setPago] = useState('');
  const [ventaFinalizada, setVentaFinalizada] = useState(false);
  const [cambio, setCambio] = useState(0);
  const [factura, setFactura] = useState(null);

  const total = calcularTotal(carrito);

  // ==========================================================================
  // MANEJO DE LA COMPRA
  // ==========================================================================

  /**
   * Procesa el pago, registra la venta en Supabase y muestra la factura.
   * Valida el monto, llama a registrarVentaEnSupabase y actualiza el estado.
   */
  const manejarCompra = async () => {
    const monto = parseFloat(pago);
    if (isNaN(monto) || monto < total) {
      alert('⚠️ Monto inválido o insuficiente.');
      return;
    }

    try {
      const { factura: nuevaFactura, cambio: nuevoCambio } = await registrarVentaEnSupabase(
        carrito,
        total,
        monto
      );

      setFactura(nuevaFactura);
      setCambio(nuevoCambio);
      setVentaFinalizada(true);
      setCarrito([]);
      setModoPago(false);
      setPago('');
    } catch (err) {
      console.error('❌ Error en la venta:', err);
      alert('❌ Error al registrar la venta: ' + err.message);
    }
  };

  // ==========================================================================
  // RENDERIZADO
  // ==========================================================================

  return (
    <div className="carrito-wrapper">
      {/* Botón toggle del carrito */}
      <button className="carrito-toggle" onClick={() => setVisible(!visible)}>
        🛒 {carrito.length}
      </button>

      {visible && (
        <div className="carrito-menu">
          <h3>🛍️ Carrito de Compras</h3>

          {ventaFinalizada && factura ? (
            // Mostrar factura
            <Factura
              factura={factura}
              onCerrar={() => {
                setVentaFinalizada(false);
                setFactura(null);
                setVisible(false);
              }}
            />
          ) : carrito.length === 0 ? (
            <p>Tu carrito está vacío.</p>
          ) : (
            <>
              {/* Lista de productos */}
              <ul>
                {carrito.map((item, index) => (
                  <li key={index}>
                    {item.nombre} x {item.cantidad} = Bs {(item.precio * item.cantidad).toFixed(2)}
                    <button onClick={() => eliminarDelCarrito(index)}>❌</button>
                  </li>
                ))}
              </ul>

              <p><strong>Total:</strong> Bs {total.toFixed(2)}</p>

              {modoPago ? (
                <>
                  <input
                    type="number"
                    placeholder="¿Con cuánto pagará?"
                    value={pago}
                    onChange={(e) => setPago(e.target.value)}
                    style={{ marginTop: '10px', padding: '5px', width: '100%' }}
                  />
                  <button onClick={manejarCompra} style={{ marginTop: '10px' }}>
                    Confirmar Pago
                  </button>
                </>
              ) : (
                <button type="button" onClick={() => setModoPago(true)}>
                  Finalizar Compra
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}