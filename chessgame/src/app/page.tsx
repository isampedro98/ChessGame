'use client';

import { useCallback, useMemo, useState } from 'react';

import {
  crearPartidaEstandar,
  Equipo,
  Partida,
  type Pieza,
  PiezaTipo,
  Posicion,
  type Movimiento,
  type ResolucionMovimiento,
} from '@/domain/chess';

import { ChessScene } from './ChessScene';

type CasillaInfo = {
  id: string;
  posicion: Posicion;
  pieza?: Pieza;
  esOscura: boolean;
};

type SeleccionActual = {
  piezaId: string;
  origenKey: string;
};

type MovimientoDetallado = {
  titulo: string;
  detalles: string[];
};

const simbolosPorTipo: Record<PiezaTipo, string> = {
  [PiezaTipo.Rey]: 'K',
  [PiezaTipo.Reina]: 'Q',
  [PiezaTipo.Torre]: 'R',
  [PiezaTipo.Alfil]: 'B',
  [PiezaTipo.Caballo]: 'N',
  [PiezaTipo.Peon]: 'P',
};

const FILES = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
const RANKS = ['8', '7', '6', '5', '4', '3', '2', '1'];

const construirCasillas = (partida: Partida): CasillaInfo[] => {
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

const simboloDePieza = (pieza: Pieza): string => {
  const base = simbolosPorTipo[pieza.tipo];
  return pieza.perteneceA(Equipo.Blanco) ? base : base.toLowerCase();
};

const claseDePieza = (pieza: Pieza): string => (
  pieza.perteneceA(Equipo.Blanco)
    ? 'bg-white/10 text-slate-50 ring-1 ring-white/40'
    : 'bg-slate-200 text-slate-900'
);

const nombreEquipo = (equipo: Equipo): string =>
  equipo === Equipo.Blanco ? 'Blancas' : 'Negras';

const describirMovimiento = (
  indice: number,
  movimiento: Movimiento,
  pieza: Pieza | undefined,
  resolucion: ResolucionMovimiento,
): MovimientoDetallado => {
  const etiquetaPieza = pieza ? simboloDePieza(pieza) : '';
  const titulo = `${indice + 1}. ${etiquetaPieza ? etiquetaPieza + ' ' : ''}${movimiento.descripcion()}`;

  const detalles: string[] = [];
  if (resolucion.piezaCapturada) {
    detalles.push(
      `Captura ${simboloDePieza(resolucion.piezaCapturada)} en ${movimiento.destino.toAlgebraica()}`,
    );
  }
  if (resolucion.esCoronacion && resolucion.piezaPromocionada) {
    detalles.push(`Corona a ${simboloDePieza(resolucion.piezaPromocionada)}`);
  }

  return { titulo, detalles };
};

const piezasParaEscena = (partida: Partida) =>
  partida
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

export default function Home(): JSX.Element {
  const [partida] = useState(() => crearPartidaEstandar());
  const [version, setVersion] = useState(0);
  const [seleccion, setSeleccion] = useState<SeleccionActual | null>(null);
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [mensaje, setMensaje] = useState<string | null>(null);

  const casillas = useMemo(() => {
    void version;
    return construirCasillas(partida);
  }, [partida, version]);
  const destinosDisponibles = useMemo(
    () => new Set(movimientos.map((mov) => mov.destino.toKey())),
    [movimientos],
  );
  const historial = useMemo(() => {
    void version;
    return partida.historialMovimientos();
  }, [partida, version]);
  const tablero = partida.obtenerTablero();
  const piezasEscena = useMemo(() => {
    void version;
    return piezasParaEscena(partida);
  }, [partida, version]);

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

  return (
    <div className="min-h-screen bg-slate-950 px-6 py-12 text-slate-100">
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-12">
        <header className="space-y-3">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Chess Lab</p>
          <h1 className="text-3xl font-semibold">Motor de ajedrez + escena Three.js</h1>
          <p className="max-w-3xl text-slate-400">
            El dominio se modela con clases puras en TypeScript para que los movimientos, el estado de la partida y las reglas
            del juego sean independientes del render. A la derecha dejamos un placeholder para inyectar la escena WebGL.
          </p>
        </header>

        <section className="grid gap-12 lg:grid-cols-[minmax(0,420px)_1fr]">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Tablero del dominio</h2>
            <div className="relative ml-6 inline-block pb-8">
              <div className="grid w-full grid-cols-8 grid-rows-8 overflow-hidden rounded-xl border border-slate-800 shadow-inner">
                {casillas.map((casilla) => {
                  const key = casilla.posicion.toKey();
                  const esSeleccionada = seleccion?.origenKey === key;
                  const esDestino = destinosDisponibles.has(key);
                  const hayPiezaRival =
                    esDestino && casilla.pieza && !casilla.pieza.perteneceA(turnoActual);

                  const base = casilla.esOscura ? 'bg-slate-800' : 'bg-slate-700/40';
                  const highlight = esSeleccionada
                    ? 'ring-2 ring-emerald-400/70 ring-inset'
                    : esDestino
                    ? hayPiezaRival
                      ? 'bg-emerald-500/30'
                      : 'bg-emerald-400/20'
                    : '';

                  return (
                    <button
                      key={casilla.id}
                      type="button"
                      onClick={() => manejarClickCasilla(casilla)}
                      className={`relative aspect-square flex items-center justify-center text-lg font-semibold transition ${base} ${highlight} focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900`}
                      aria-label={`Casilla ${casilla.id}`}
                    >
                      {casilla.pieza ? (
                        <span
                          className={`inline-flex h-9 w-9 items-center justify-center rounded-full text-base font-semibold ${claseDePieza(
                            casilla.pieza,
                          )}`}
                        >
                          {simboloDePieza(casilla.pieza)}
                        </span>
                      ) : esDestino ? (
                        <span className="h-3 w-3 rounded-full bg-emerald-200/70" />
                      ) : null}
                    </button>
                  );
                })}
              </div>
              <div className="pointer-events-none.absolute -left-6 top-0 grid h-full grid-rows-8 place-items-center text-xs font-semibold text-slate-500">
                {RANKS.map((rank) => (
                  <span key={rank}>{rank}</span>
                ))}
              </div>
              <div className="pointer-events-none absolute bottom-0 left-0 grid w-full grid-cols-8 place-items-center text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                {FILES.map((file) => (
                  <span key={file}>{file}</span>
                ))}
              </div>
            </div>
            <p className="text-sm text-slate-500">
              Renderizamos la cuadrilla directamente desde el modelo para depurar reglas y servir de base a la escena 3D.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Escena Three.js</h2>
            <div className="flex h-[420px] w-full items-center justify-center overflow-hidden rounded-xl border border-slate-800 bg-slate-900/50">
              <ChessScene piezasIniciales={piezasEscena} />
            </div>
            <div className="space-y-4">
              <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-4 text-sm text-slate-300">
                <p>
                  Turno actual:
                  <span className="ml-1 font-semibold text-slate-100">{nombreEquipo(turnoActual)}</span>
                </p>
                <p className="mt-3 text-slate-400">{instruccion}</p>
                {mensaje ? (
                  <p className="mt-2 rounded bg-amber-400/10 px-3 py-2 text-amber-200">
                    {mensaje}
                  </p>
                ) : null}
              </div>
              <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
                <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">
                  Historial
                </h3>
                {historial.length === 0 ? (
                  <p className="mt-3 text-sm text-slate-500">Sin movimientos todavía.</p>
                ) : (
                  <ol className="mt-3 space-y-3 text-sm text-slate-300">
                    {historial.map(({ movimiento, resolucion }, index) => {
                      const pieza = tablero.obtenerPieza(movimiento.destino);
                      const descripcion = describirMovimiento(index, movimiento, pieza, resolucion);
                      return (
                        <li key={index} className="space-y-1">
                          <div className="flex items-center justify-between gap-3">
                            <span className="font-mono text-xs text-slate-500">#{index + 1}</span>
                            <span>{descripcion.titulo}</span>
                          </div>
                          {descripcion.detalles.map((detalle, detalleIndex) => (
                            <p
                              key={`${index}-${detalleIndex}`}
                              className="pl-6 text-xs text-slate-500"
                            >
                              {detalle}
                            </p>
                          ))}
                        </li>
                      );
                    })}
                  </ol>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}




