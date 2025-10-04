'use client';

import type { CasillaInfo } from '@/app/hooks/useChessUI';
import { FILES, RANKS, claseDePieza, simboloDePieza } from '@/app/chess-ui/helpers';
import { Equipo } from '@/domain/chess';

interface BoardGridProps {
  casillas: CasillaInfo[];
  destinosDisponibles: Set<string>;
  seleccionKey: string | null;
  turnoActual: Equipo;
  onCasillaClick(casilla: CasillaInfo): void;
}

export const BoardGrid = ({
  casillas,
  destinosDisponibles,
  seleccionKey,
  turnoActual,
  onCasillaClick,
}: BoardGridProps) => (
  <div className="relative ml-6 inline-block pb-8">
    <div className="grid w-full grid-cols-8 grid-rows-8 overflow-hidden rounded-xl border border-slate-800 shadow-inner">
      {casillas.map((casilla) => {
        const key = casilla.posicion.toKey();
        const esSeleccionada = seleccionKey === key;
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
            onClick={() => onCasillaClick(casilla)}
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
);
