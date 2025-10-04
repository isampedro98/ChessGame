'use client';

import { useState } from 'react';

import { BoardGrid } from '@/app/components/BoardGrid';
import { HistoryPanel } from '@/app/components/HistoryPanel';
import { InfoPanel } from '@/app/components/InfoPanel';
import { useChessUI } from '@/app/hooks/useChessUI';
import { ChessScene } from '@/app/ChessScene';
import { crearPartidaEstandar } from '@/domain/chess';

export default function Home(): JSX.Element {
  const [partida] = useState(() => crearPartidaEstandar());
  const {
    casillas,
    destinosDisponibles,
    historialDetallado,
    instruccion,
    mensaje,
    onCasillaClick,
    piezasEscena,
    seleccionKey,
    turnoActual,
  } = useChessUI(partida);

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
            <BoardGrid
              casillas={casillas}
              destinosDisponibles={destinosDisponibles}
              seleccionKey={seleccionKey}
              turnoActual={turnoActual}
              onCasillaClick={onCasillaClick}
            />
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
              <InfoPanel turnoActual={turnoActual} instruccion={instruccion} mensaje={mensaje} />
              <HistoryPanel historial={historialDetallado} />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
