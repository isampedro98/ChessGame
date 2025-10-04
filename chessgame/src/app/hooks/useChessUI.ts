'use client';

import { useCallback, useMemo, useState } from 'react';

import {
  Equipo,
  Partida,
  PiezaTipo,
  Posicion,
  type Movimiento,
  type Pieza,
} from '@/domain/chess';

import {
  describirMovimiento,
  type MovimientoDetallado,
} from '@/app/chess-ui/helpers';

export type CasillaInfo = {
  id: string;
  posicion: Posicion;
  pieza?: Pieza;
  esOscura: boolean;
};

type SeleccionActual = {
  piezaId: string;
  origenKey: string;
};

export type HistorialItem = MovimientoDetallado & {
  numero: number;
};

export type PiezaEscena = {
  id: string;
  tipo: PiezaTipo;
  equipo: Equipo;
  posicion: { fila: number; columna: number };
};

const construirCasillas = (partida: Partida, version: number): CasillaInfo[] => {
  void version;
  const tablero = partida.obtenerTablero();
  const casillas: CasillaInfo[] = [];

  for (let fila = 7; fila >= 0; fila -= 1) {
    for (let columna = 0; columna < 8; columna += 1) {
      const posicion = Posicion.desdeCoordenadas(fila, columna);
      casillas.push({
        id: posicion.toAlgebraica(),
        posicion,
        pieza: tablero.obtenerPieza(posicion),
        esOscura: (fila + columna) % 2 === 1,
      });
    }
  }

  return casillas;
};

const construirHistorial = (partida: Partida, version: number): HistorialItem[] => {
  void version;
  const historial = partida.historialMovimientos();
  const tablero = partida.obtenerTablero();

  return historial.map(({ movimiento, resolucion }, index) => {
    const pieza = tablero.obtenerPieza(movimiento.destino);
    const descripcion = describirMovimiento(index, movimiento, pieza, resolucion);
    return {
      numero: index + 1,
      ...descripcion,
    };
  });
};

const piezasParaEscena = (partida: Partida, version: number): PiezaEscena[] => {
  void version;
  return partida
    .obtenerTablero()
    .todasLasPiezas()
    .map((pieza) => ({
      id: pieza.id,
      tipo: pieza.tipo,
      equipo: pieza.equipo,
      posicion: {
        fila: pieza.obtenerPosicion().fila,
        columna: pieza.obtenerPosicion().columna,
      },
    }));
};

export const useChessUI = (partida: Partida) => {
  const [version, setVersion] = useState(0);
  const [seleccion, setSeleccion] = useState<SeleccionActual | null>(null);
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [mensaje, setMensaje] = useState<string | null>(null);

  const casillas = useMemo(() => construirCasillas(partida, version), [partida, version]);

  const destinosDisponibles = useMemo(
    () => new Set(movimientos.map((mov) => mov.destino.toKey())),
    [movimientos],
  );

  const historialDetallado = useMemo(
    () => construirHistorial(partida, version),
    [partida, version],
  );

  const piezasEscena = useMemo(
    () => piezasParaEscena(partida, version),
    [partida, version],
  );

  const manejarClickCasilla = useCallback(
    (casilla: CasillaInfo) => {
      const key = casilla.posicion.toKey();
      const turnoActual = partida.obtenerTurno();

      if (seleccion && destinosDisponibles.has(key)) {
        const movimiento = movimientos.find((mov) => mov.destino.toKey() === key);
        if (!movimiento) {
          return;
        }
        try {
          partida.ejecutarMovimiento(movimiento);
          setSeleccion(null);
          setMovimientos([]);
          setVersion((valor) => valor + 1);
          setMensaje(null);
        } catch (error) {
          setMensaje(error instanceof Error ? error.message : 'Movimiento invalido');
        }
        return;
      }

      if (seleccion && seleccion.origenKey === key) {
        setSeleccion(null);
        setMovimientos([]);
        setMensaje(null);
        return;
      }

      if (casilla.pieza && casilla.pieza.perteneceA(turnoActual)) {
        const nuevosMovimientos = partida.generarMovimientosPara(casilla.pieza.id);
        setSeleccion({ piezaId: casilla.pieza.id, origenKey: key });
        setMovimientos(nuevosMovimientos);
        setMensaje(
          nuevosMovimientos.length === 0
            ? 'Esta pieza no tiene movimientos legales.'
            : null,
        );
        return;
      }

      if (seleccion) {
        setSeleccion(null);
        setMovimientos([]);
        setMensaje(null);
      }
    },
    [destinosDisponibles, movimientos, partida, seleccion],
  );

  const turnoActual = partida.obtenerTurno();
  const instruccion = seleccion
    ? 'Elegi una casilla destino para completar el movimiento.'
    : 'Selecciona una pieza del turno actual para ver sus movimientos.';

  return {
    casillas,
    destinosDisponibles,
    historialDetallado,
    instruccion,
    mensaje,
    onCasillaClick: manejarClickCasilla,
    piezasEscena,
    seleccionKey: seleccion?.origenKey ?? null,
    turnoActual,
  };
};
