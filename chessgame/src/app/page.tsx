'use client';

import { useMemo, useState } from 'react';

import {
  crearPartidaEstandar,
  Equipo,
  Partida,
  type Pieza,
  PiezaTipo,
  Posicion,
} from '@/domain/chess';

type CasillaInfo = {
  id: string;
  posicion: Posicion;
  pieza?: Pieza;
  esOscura: boolean;
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

export default function Home(): JSX.Element {
  const [partida] = useState(() => crearPartidaEstandar());
  const casillas = useMemo(() => construirCasillas(partida), [partida]);

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
                {casillas.map((casilla) => (
                  <div
                    key={casilla.id}
                    className={`aspect-square flex items-center justify-center text-lg font-semibold ${
                      casilla.esOscura ? 'bg-slate-800' : 'bg-slate-700/40'
                    }`}
                  >
                    {casilla.pieza ? (
                      <span
                        className={`inline-flex h-9 w-9 items-center justify-center rounded-full text-base font-semibold ${
                          claseDePieza(casilla.pieza)
                        }`}
                      >
                        {simboloDePieza(casilla.pieza)}
                      </span>
                    ) : null}
                  </div>
                ))}
              </div>
              <div className="pointer-events-none absolute -left-6 top-0 grid h-full grid-rows-8 place-items-center text-xs font-semibold text-slate-500">
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
            <div className="flex h-[420px] w-full items-center justify-center rounded-xl border border-slate-800 bg-slate-900/50">
              <p className="text-sm text-slate-500">Placeholder para montar el canvas WebGL.</p>
            </div>
            <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-4 text-sm text-slate-300">
              <p>
                Turno actual:
                <span className="ml-1 font-semibold text-slate-100">{nombreEquipo(partida.obtenerTurno())}</span>
              </p>
              <p className="mt-3 text-slate-400">
                Puedes suscribirte a los movimientos del dominio para disparar animaciones, sonidos o efectos en la vista 3D sin
                mezclar responsabilidades.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
);
}

