'use client';

import type { HistorialItem } from '@/app/hooks/useChessUI';

interface HistoryPanelProps {
  historial: HistorialItem[];
}

export const HistoryPanel = ({ historial }: HistoryPanelProps) => (
  <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
    <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">Historial</h3>
    {historial.length === 0 ? (
      <p className="mt-3 text-sm text-slate-500">Sin movimientos todavia.</p>
    ) : (
      <ol className="mt-3 space-y-3 text-sm text-slate-300">
        {historial.map(({ numero, titulo, detalles }) => (
          <li key={numero} className="space-y-1">
            <div className="flex items-center justify-between gap-3">
              <span className="font-mono text-xs text-slate-500">#{numero}</span>
              <span>{titulo}</span>
            </div>
            {detalles.map((detalle, detalleIndex) => (
              <p key={`${numero}-${detalleIndex}`} className="pl-6 text-xs text-slate-500">
                {detalle}
              </p>
            ))}
          </li>
        ))}
      </ol>
    )}
  </div>
);
