'use client';

import { nombreEquipo } from '@/app/chess-ui/helpers';
import { Equipo } from '@/domain/chess';

interface InfoPanelProps {
  turnoActual: Equipo;
  instruccion: string;
  mensaje: string | null;
}

export const InfoPanel = ({ turnoActual, instruccion, mensaje }: InfoPanelProps) => (
  <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-4 text-sm text-slate-300">
    <p>
      Turno actual:
      <span className="ml-1 font-semibold text-slate-100">{nombreEquipo(turnoActual)}</span>
    </p>
    <p className="mt-3 text-slate-400">{instruccion}</p>
    {mensaje ? (
      <p className="mt-2 rounded bg-amber-400/10 px-3 py-2 text-amber-200">{mensaje}</p>
    ) : null}
  </div>
);
