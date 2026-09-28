// src/components/ReservaMesas.jsx
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import './ReservaMesas.css';

// ============================================================================
// 1. CONFIGURACIÓN DE SUPABASE Y CONSTANTES
// ============================================================================

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const HORAS = Array.from({ length: 15 }, (_, i) => {
  const h = 8 + i;
  return `${String(h).padStart(2, '0')}:00`;
});

// ============================================================================
// 2. REGLAS DE VALIDACIÓN
// ============================================================================

const REGEX = {
  soloLetras:   /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/,
  telefono:     /^\+?[\d\s\-()]{7,15}$/,
  soloNumeros:  /^\d+$/,
};

/**
 * Valida cada campo individualmente y devuelve un objeto de errores.
 */
const validarCampos = ({ nombre, telefono, fecha, hora, mesa, cantidadPersonas }) => {
  const errores = {};

  // Nombre
  if (!nombre.trim()) {
    errores.nombre = 'El nombre es obligatorio';
  } else if (nombre.trim().length < 3) {
    errores.nombre = 'El nombre debe tener al menos 3 caracteres';
  } else if (nombre.trim().length > 50) {
    errores.nombre = 'El nombre no puede superar los 50 caracteres';
  } else if (!REGEX.soloLetras.test(nombre.trim())) {
    errores.nombre = 'El nombre solo puede contener letras';
  }

  // Teléfono
  if (!telefono.trim()) {
    errores.telefono = 'El teléfono es obligatorio';
  } else if (!REGEX.telefono.test(telefono.trim())) {
    errores.telefono = 'Formato inválido. Ej: +591 76543210';
  }

  // Cantidad de personas
  const personas = parseInt(cantidadPersonas);
  if (!cantidadPersonas || isNaN(personas)) {
    errores.cantidadPersonas = 'Ingresa una cantidad válida';
  } else if (personas < 1) {
    errores.cantidadPersonas = 'Debe haber al menos 1 persona';
  } else if (personas > 10) {
    errores.cantidadPersonas = 'Máximo 10 personas por reserva';
  } else if (mesa && personas > mesa.capacidad) {
    errores.cantidadPersonas = `La mesa elegida tiene capacidad máxima de ${mesa.capacidad} personas`;
  }

  // Fecha
  if (!fecha) {
    errores.fecha = 'Selecciona una fecha';
  } else {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const fechaElegida = new Date(fecha + 'T00:00:00');
    if (fechaElegida <= hoy) {
      errores.fecha = 'La fecha debe ser a partir de mañana';
    }
    // No permitir reservas con más de 60 días de anticipación
    const limite = new Date();
    limite.setDate(limite.getDate() + 60);
    if (fechaElegida > limite) {
      errores.fecha = 'No se puede reservar con más de 60 días de anticipación';
    }
  }

  // Mesa
  if (!mesa) {
    errores.mesa = 'Selecciona una mesa';
  }

  // Hora
  if (!hora) {
    errores.hora = 'Selecciona un horario';
  }

  return errores;
};

// ============================================================================
// 3. FUNCIONES DE SUPABASE
// ============================================================================

const obtenerMesas = async () => {
  const { data, error } = await supabase
    .from('mesas')
    .select('id, numero, capacidad, estado');
  if (error) throw new Error(`Error al obtener mesas: ${error.message}`);
  return data || [];
};

const limpiarReservasPasadas = async () => {
  const ahora = new Date();
  const ahoraISO = `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, '0')}-${String(ahora.getDate()).padStart(2, '0')}T${String(ahora.getHours()).padStart(2, '0')}:${String(ahora.getMinutes()).padStart(2, '0')}:00`;
  const { error } = await supabase
    .from('reservas')
    .delete()
    .lt('fecha_fin', ahoraISO);
  if (error) console.error('Error al limpiar reservas pasadas:', error.message);
};

const obtenerReservasPorFecha = async (mesaId, fecha) => {
  const fechaInicio = `${fecha}T00:00:00`;
  const fechaFin = `${fecha}T23:59:59`;

  const { data, error } = await supabase
    .from('reservas')
    .select('fecha_reserva')
    .eq('mesa_id', mesaId)
    .gte('fecha_reserva', fechaInicio)
    .lte('fecha_reserva', fechaFin)
    .in('estado', ['confirmada', 'pendiente']);

  if (error) throw new Error(`Error al cargar reservas: ${error.message}`);

  return (data || []).map((r) => {
    const parteHora = r.fecha_reserva.substring(11, 16);
    const [h] = parteHora.split(':');
    return `${String(parseInt(h)).padStart(2, '0')}:00`;
  });
};

const crearReserva = async ({ mesaId, fecha, hora, cantidadPersonas, nombre, telefono }) => {
  const [anio, mes, dia] = fecha.split('-').map(Number);
  const [horas] = hora.split(':').map(Number);

  const fechaObj = new Date(anio, mes - 1, dia, horas, 0, 0);
  if (isNaN(fechaObj.getTime())) throw new Error(`Fecha inválida: fecha=${fecha}, hora=${hora}`);

  const fechaReserva = `${fecha}T${hora}:00`;
  const horaFin = horas + 1;
  const fechaFinStr = `${fecha}T${String(horaFin).padStart(2, '0')}:00:00`;

  const { data, error } = await supabase
    .from('reservas')
    .insert([{
      mesa_id: mesaId,
      cliente_id: 1,
      fecha_reserva: fechaReserva,
      fecha_fin: fechaFinStr,
      estado: 'confirmada',
      cantidad_personas: parseInt(cantidadPersonas),
      observacion: `Cliente: ${nombre.trim()} | Teléfono: ${telefono.trim()}`
    }])
    .select()
    .single();

  if (error) throw new Error(`Error al crear reserva: ${error.message}`);
  return data;
};

const formatearFecha = (fecha, hora) => {
  const [anio, mes, dia] = fecha.split('-').map(Number);
  const [horas] = hora.split(':').map(Number);
  const fechaObj = new Date(anio, mes - 1, dia, horas, 0, 0);
  return fechaObj.toLocaleDateString('es-ES', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
};

const obtenerFechaMinima = () => {
  const hoy = new Date();
  hoy.setDate(hoy.getDate() + 1);
  return hoy.toISOString().split('T')[0];
};

const obtenerFechaMaxima = () => {
  const limite = new Date();
  limite.setDate(limite.getDate() + 60);
  return limite.toISOString().split('T')[0];
};

// ============================================================================
// 4. COMPONENTE DE ERROR INLINE
// ============================================================================

const ErrorMsg = ({ mensaje }) =>
  mensaje ? (
    <span style={{ color: '#e74c3c', fontSize: '12px', display: 'block', marginTop: '3px' }}>
      ⚠️ {mensaje}
    </span>
  ) : null;

// ============================================================================
// 5. COMPONENTE DE CONFIRMACIÓN
// ============================================================================

const ConfirmacionReserva = ({ reserva, onNuevaReserva }) => (
  <div style={{ backgroundColor: '#d4edda', border: '2px solid #28a745', padding: '20px', borderRadius: '8px', marginTop: '20px' }}>
    <h3 style={{ color: '#155724', marginTop: 0 }}>✅ ¡Reserva Confirmada!</h3>
    <div style={{ fontSize: '16px', color: '#155724' }}>
      <p><strong>Confirmación #:</strong> {reserva.reservaId}</p>
      <p><strong>Nombre:</strong> {reserva.nombre}</p>
      <p><strong>Teléfono:</strong> {reserva.telefono}</p>
      <hr />
      <p><strong>Mesa:</strong> Mesa #{reserva.mesa}</p>
      <p><strong>Fecha:</strong> {reserva.fecha}</p>
      <p><strong>Hora:</strong> {reserva.hora}</p>
      <p><strong>Personas:</strong> {reserva.personas}</p>
      <hr />
      <p style={{ fontSize: '12px', color: '#666' }}>Llega 10 minutos antes de la hora reservada</p>
    </div>
    <button
      onClick={onNuevaReserva}
      style={{ marginTop: '15px', padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '14px' }}
    >
      Hacer otra reserva
    </button>
  </div>
);

// ============================================================================
// 6. COMPONENTE PRINCIPAL
// ============================================================================

export default function ReservaMesas() {
  const [mesas, setMesas] = useState([]);
  const [mesaSeleccionada, setMesaSeleccionada] = useState(null);
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [fecha, setFecha] = useState('');
  const [horaSeleccionada, setHoraSeleccionada] = useState(null);
  const [cantidadPersonas, setCantidadPersonas] = useState(2);
  const [horasOcupadas, setHorasOcupadas] = useState([]);
  const [reservaConfirmada, setReservaConfirmada] = useState(null);
  const [cargandoHoras, setCargandoHoras] = useState(false);
  const [errores, setErrores] = useState({});
  const [tocados, setTocados] = useState({}); // campos que el usuario ya tocó

  // Cargar mesas al montar
  useEffect(() => {
    const cargarMesas = async () => {
      try {
        await limpiarReservasPasadas();
        const data = await obtenerMesas();
        setMesas(data);
      } catch (err) {
        console.error('Error al obtener mesas:', err);
      }
    };
    cargarMesas();
  }, []);

  // Cargar horarios ocupados cuando cambia mesa o fecha
  useEffect(() => {
    if (fecha && mesaSeleccionada) {
      const cargarReservas = async () => {
        setCargandoHoras(true);
        try {
          const ocupadas = await obtenerReservasPorFecha(mesaSeleccionada.id, fecha);
          setHorasOcupadas(ocupadas);
          if (horaSeleccionada && ocupadas.includes(horaSeleccionada)) {
            setHoraSeleccionada(null);
          }
        } catch (err) {
          console.error('Error al cargar reservas:', err);
        } finally {
          setCargandoHoras(false);
        }
      };
      cargarReservas();
    } else {
      setHorasOcupadas([]);
    }
  }, [fecha, mesaSeleccionada]);

  // Revalidar en tiempo real cuando cambian los campos
  useEffect(() => {
    const nuevosErrores = validarCampos({
      nombre, telefono, fecha,
      hora: horaSeleccionada,
      mesa: mesaSeleccionada,
      cantidadPersonas
    });
    setErrores(nuevosErrores);
  }, [nombre, telefono, fecha, horaSeleccionada, mesaSeleccionada, cantidadPersonas]);

  /** Marca un campo como tocado para mostrar su error */
  const marcarTocado = (campo) => setTocados((prev) => ({ ...prev, [campo]: true }));

  /** Maneja que solo se ingresen letras en el nombre */
  const manejarNombre = (e) => {
    const val = e.target.value;
    // Permite borrar, pero bloquea números y símbolos especiales
    if (val === '' || REGEX.soloLetras.test(val)) {
      setNombre(val);
    }
  };

  /** Maneja que solo se ingresen números y caracteres de teléfono */
  const manejarTelefono = (e) => {
    const val = e.target.value;
    // Permite +, números, espacios, guiones y paréntesis
    if (/^[\d\s\+\-()]*$/.test(val)) {
      setTelefono(val);
    }
  };

  /** Maneja que la cantidad sea solo número entero positivo */
  const manejarCantidad = (e) => {
    const val = e.target.value;
    if (val === '' || (REGEX.soloNumeros.test(val) && parseInt(val) <= 10)) {
      setCantidadPersonas(val);
    }
  };

  const manejarReserva = async () => {
    // Marcar todos los campos como tocados para mostrar todos los errores
    setTocados({ nombre: true, telefono: true, fecha: true, mesa: true, hora: true, cantidadPersonas: true });

    const erroresActuales = validarCampos({
      nombre, telefono, fecha,
      hora: horaSeleccionada,
      mesa: mesaSeleccionada,
      cantidadPersonas
    });

    if (Object.keys(erroresActuales).length > 0) return;

    if (horasOcupadas.includes(horaSeleccionada)) {
      alert('⚠️ Ese horario ya está ocupado. Por favor elige otro.');
      return;
    }

    try {
      const reservaCreada = await crearReserva({
        mesaId: mesaSeleccionada.id,
        fecha, hora: horaSeleccionada,
        cantidadPersonas, nombre, telefono
      });

      setReservaConfirmada({
        mesa: mesaSeleccionada.numero,
        fecha: formatearFecha(fecha, horaSeleccionada),
        hora: horaSeleccionada,
        personas: cantidadPersonas,
        nombre: nombre.trim(),
        telefono: telefono.trim(),
        reservaId: reservaCreada.id
      });

      // Limpiar todo
      setNombre(''); setTelefono(''); setFecha('');
      setHoraSeleccionada(null); setMesaSeleccionada(null);
      setCantidadPersonas(2); setHorasOcupadas([]);
      setTocados({}); setErrores({});
    } catch (err) {
      console.error('Error al reservar:', err);
      alert(`❌ Error al reservar: ${err.message}`);
    }
  };

  const reiniciarReserva = () => setReservaConfirmada(null);

  const formularioSinErrores = Object.keys(errores).length === 0;

  const estiloInput = (campo) => ({
    display: 'block',
    width: '100%',
    padding: '8px',
    marginTop: '4px',
    borderRadius: '4px',
    border: tocados[campo] && errores[campo] ? '1px solid #e74c3c' : '1px solid #ccc',
    outline: 'none',
    fontSize: '14px',
  });

  const btnReservarStyle = {
    marginTop: '20px',
    padding: '12px 30px',
    backgroundColor: formularioSinErrores ? '#27ae60' : '#bdc3c7',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: formularioSinErrores ? 'pointer' : 'not-allowed',
    fontSize: '16px'
  };

  return (
    <div className="reserva-container">
      <h2>📅 Reserva de Mesas</h2>

      {reservaConfirmada ? (
        <ConfirmacionReserva reserva={reservaConfirmada} onNuevaReserva={reiniciarReserva} />
      ) : (
        <>
          {/* Nombre */}
          <label>
            Nombre del cliente:
            <input
              type="text"
              value={nombre}
              onChange={manejarNombre}
              onBlur={() => marcarTocado('nombre')}
              placeholder="Ej: Juan Pérez"
              maxLength={50}
              style={estiloInput('nombre')}
            />
            {tocados.nombre && <ErrorMsg mensaje={errores.nombre} />}
          </label>

          {/* Teléfono */}
          <label>
            Teléfono:
            <input
              type="tel"
              value={telefono}
              onChange={manejarTelefono}
              onBlur={() => marcarTocado('telefono')}
              placeholder="Ej: +591 76543210"
              maxLength={15}
              style={estiloInput('telefono')}
            />
            {tocados.telefono && <ErrorMsg mensaje={errores.telefono} />}
          </label>

          {/* Cantidad de personas */}
          <label>
            Cantidad de personas:
            <input
              type="number"
              min="1"
              max="10"
              value={cantidadPersonas}
              onChange={manejarCantidad}
              onBlur={() => marcarTocado('cantidadPersonas')}
              style={estiloInput('cantidadPersonas')}
            />
            {tocados.cantidadPersonas && <ErrorMsg mensaje={errores.cantidadPersonas} />}
          </label>

          {/* Fecha */}
          <label>
            Fecha:
            <input
              type="date"
              value={fecha}
              onChange={(e) => {
                setFecha(e.target.value);
                setHoraSeleccionada(null);
                marcarTocado('fecha');
              }}
              onBlur={() => marcarTocado('fecha')}
              min={obtenerFechaMinima()}
              max={obtenerFechaMaxima()}
              style={estiloInput('fecha')}
            />
            {tocados.fecha && <ErrorMsg mensaje={errores.fecha} />}
          </label>

          {/* Selección de mesa */}
          <h3>🪑 Selecciona una mesa</h3>
          {tocados.mesa && <ErrorMsg mensaje={errores.mesa} />}
          <div className="mesas-grid">
            {mesas.map((mesa) => (
              <div
                key={mesa.id}
                className={`mesa-card ${mesaSeleccionada?.id === mesa.id ? 'seleccionada' : ''}`}
                onClick={() => {
                  setMesaSeleccionada(mesa);
                  setHoraSeleccionada(null);
                  marcarTocado('mesa');
                }}
                style={{
                  cursor: 'pointer',
                  border: mesaSeleccionada?.id === mesa.id ? '3px solid #27ae60' : '1px solid #ddd'
                }}
              >
                <p><strong>Mesa {mesa.numero}</strong></p>
                <p className="capacidad">{mesa.capacidad} personas</p>
              </div>
            ))}
          </div>

          {/* Horarios */}
          {mesaSeleccionada && fecha && (
            <>
              <h3>🕓 Horarios disponibles para Mesa {mesaSeleccionada.numero}</h3>
              {tocados.hora && <ErrorMsg mensaje={errores.hora} />}
              {cargandoHoras ? (
                <p>Cargando horarios...</p>
              ) : (
                <div className="horario-grid">
                  {HORAS.map((h) => {
                    const ocupada = horasOcupadas.includes(h);
                    const seleccionada = horaSeleccionada === h;
                    return (
                      <button
                        key={h}
                        className={`hora-btn ${ocupada ? 'ocupada' : ''} ${seleccionada ? 'seleccionada' : ''}`}
                        disabled={ocupada}
                        onClick={() => {
                          if (!ocupada) {
                            setHoraSeleccionada(h);
                            marcarTocado('hora');
                          }
                        }}
                        title={ocupada ? 'Horario ocupado' : `Reservar a las ${h}`}
                        style={{
                          padding: '10px',
                          margin: '5px',
                          borderRadius: '4px',
                          border: seleccionada ? '2px solid #27ae60' : '1px solid #ddd',
                          backgroundColor: ocupada ? '#ecf0f1' : seleccionada ? '#eafaf1' : '#fff',
                          color: ocupada ? '#999' : '#000',
                          cursor: ocupada ? 'not-allowed' : 'pointer',
                          fontWeight: seleccionada ? 'bold' : 'normal',
                          opacity: ocupada ? 0.6 : 1,
                        }}
                      >
                        {ocupada ? `${h} 🔒` : h}
                      </button>
                    );
                  })}
                </div>
              )}
            </>
          )}

          <button
            className="btn-reservar"
            onClick={manejarReserva}
            style={btnReservarStyle}
          >
            Confirmar Reserva
          </button>
        </>
      )}
    </div>
  );
}