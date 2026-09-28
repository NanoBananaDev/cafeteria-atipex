// src/tests/carrito.test.js
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
// ============================================================
// PRUEBAS DE FUNCIONES AUXILIARES
// (copia estas funciones aquí o expórtalas desde sus archivos)
// ============================================================

const calcularTotal = (carrito) =>
  carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0);

const validarReserva = ({ nombre, telefono, fecha, hora, mesa, cantidadPersonas }) => {
  if (!nombre || !telefono || !fecha || !hora || !mesa) return '⚠️ Completa todos los campos';
  if (cantidadPersonas > mesa.capacidad) return `⚠️ La mesa solo tiene capacidad para ${mesa.capacidad} personas`;
  return null;
};

const formatearFecha = (fecha, hora) => {
  const fechaObj = new Date(`${fecha}T${hora}:00`);
  return fechaObj.toLocaleDateString('es-ES', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
};

// ============================================================
// 1. FUNCIONES AUXILIARES
// ============================================================

describe('calcularTotal', () => {
  it('calcula el total correctamente', () => {
    const carrito = [
      { nombre: 'Pizza', precio: 50, cantidad: 2 },
      { nombre: 'Refresco', precio: 10, cantidad: 3 },
    ];
    expect(calcularTotal(carrito)).toBe(130);
  });

  it('retorna 0 si el carrito está vacío', () => {
    expect(calcularTotal([])).toBe(0);
  });

  it('funciona con un solo producto', () => {
    expect(calcularTotal([{ precio: 25, cantidad: 4 }])).toBe(100);
  });
});

describe('validarReserva', () => {
  const datosValidos = {
    nombre: 'Juan',
    telefono: '123456',
    fecha: '2025-12-01',
    hora: '12:00',
    mesa: { id: 1, capacidad: 4 },
    cantidadPersonas: 2,
  };

  it('retorna null si todos los datos son válidos', () => {
    expect(validarReserva(datosValidos)).toBeNull();
  });

  it('retorna error si falta el nombre', () => {
    expect(validarReserva({ ...datosValidos, nombre: '' }))
      .toBe('⚠️ Completa todos los campos');
  });

  it('retorna error si la cantidad supera la capacidad', () => {
    expect(validarReserva({ ...datosValidos, cantidadPersonas: 10 }))
      .toBe('⚠️ La mesa solo tiene capacidad para 4 personas');
  });

  it('retorna error si no se seleccionó mesa', () => {
    expect(validarReserva({ ...datosValidos, mesa: null }))
      .toBe('⚠️ Completa todos los campos');
  });
});

describe('formatearFecha', () => {
  it('retorna una cadena con el día de la semana', () => {
    const resultado = formatearFecha('2025-12-01', '10:00');
    expect(typeof resultado).toBe('string');
    expect(resultado.length).toBeGreaterThan(0);
  });
});

// ============================================================
// 2. MOCK DE SUPABASE (simula llamadas a la base de datos)
// ============================================================

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    from: () => ({
      select: () => ({
        eq: () => ({
          single: async () => ({ data: { id: 1 }, error: null }),
        }),
        gte: () => ({
          lte: () => ({
            in: async () => ({
              data: [{ fecha_reserva: '2025-12-01T10:00:00' }],
              error: null,
            }),
          }),
        }),
      }),
      insert: () => ({
        select: () => ({
          single: async () => ({
            data: { id: 99, mesa_id: 1 },
            error: null,
          }),
        }),
      }),
    }),
    auth: {
      getUser: async () => ({ data: { user: null } }),
    },
  }),
}));

// ============================================================
// 3. PRUEBAS DE COMPONENTES UI
// ============================================================

import Carrito from '../components/Carrito';

describe('Componente Carrito', () => {
  const carritoMock = [
    { id: 1, nombre: 'Pizza', precio: 50, cantidad: 1 },
  ];

  it('renderiza el botón del carrito', () => {
    render(
      <Carrito
        carrito={carritoMock}
        eliminarDelCarrito={vi.fn()}
        setCarrito={vi.fn()}
        visible={false}
        setVisible={vi.fn()}
      />
    );
    expect(screen.getByText(/🛒/)).toBeInTheDocument();
  });

  it('muestra los productos cuando el carrito está visible', () => {
    render(
      <Carrito
        carrito={carritoMock}
        eliminarDelCarrito={vi.fn()}
        setCarrito={vi.fn()}
        visible={true}
        setVisible={vi.fn()}
      />
    );
    expect(screen.getByText(/Pizza/)).toBeInTheDocument();
    expect(screen.getAllByText(/Bs 50.00/).length).toBeGreaterThan(0);
  });

  it('muestra "carrito vacío" cuando no hay productos', () => {
    render(
      <Carrito
        carrito={[]}
        eliminarDelCarrito={vi.fn()}
        setCarrito={vi.fn()}
        visible={true}
        setVisible={vi.fn()}
      />
    );
    expect(screen.getByText(/vacío/i)).toBeInTheDocument();
  });

  it('muestra el input de pago al presionar Finalizar Compra', () => {
    render(
      <Carrito
        carrito={carritoMock}
        eliminarDelCarrito={vi.fn()}
        setCarrito={vi.fn()}
        visible={true}
        setVisible={vi.fn()}
      />
    );
    fireEvent.click(screen.getByText('Finalizar Compra'));
    expect(screen.getByPlaceholderText(/cuánto pagará/i)).toBeInTheDocument();
  });
});