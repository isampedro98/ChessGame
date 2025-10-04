'use client';

import { JSX, useState } from 'react';

import { BoardGrid } from '@/app/components/BoardGrid';
import { HistoryPanel } from '@/app/components/HistoryPanel';
import { InfoPanel } from '@/app/components/InfoPanel';
import { LanguageSwitcher } from '@/app/components/LanguageSwitcher';
import { useChessUI } from '@/app/hooks/useChessUI';
import { useTranslation } from '@/app/i18n/TranslationProvider';
import { ChessScene } from '@/app/ChessScene';
import { createStandardGame } from '@/domain/chess';

export default function Home(): JSX.Element {
  const [game] = useState(() => createStandardGame());
  const {
    squares,
    availableDestinations,
    history,
    instruction,
    message,
    onSquareClick,
    scenePieces,
    selectedSquareKey,
    currentTurn,
  } = useChessUI(game);
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-slate-950 px-6 py-12 text-slate-100">
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-12">
        <header className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-3">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">{t('app.tagline')}</p>
            <h1 className="text-3xl font-semibold">{t('app.title')}</h1>
            <p className="max-w-3xl text-slate-400">{t('app.description')}</p>
          </div>
          <LanguageSwitcher />
        </header>

        <section className="grid gap-12 lg:grid-cols-[minmax(0,420px)_1fr]">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">{t('board.title')}</h2>
            <BoardGrid
              squares={squares}
              availableDestinations={availableDestinations}
              selectedSquareKey={selectedSquareKey}
              currentTurn={currentTurn}
              onSquareClick={onSquareClick}
            />
            <p className="text-sm text-slate-500">{t('board.subtitle')}</p>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-semibold">{t('scene.title')}</h2>
            <div className="flex h-[420px] w-full items-center justify-center overflow-hidden rounded-xl border border-slate-800 bg-slate-900/50">
              <ChessScene initialPieces={scenePieces} />
            </div>
            <div className="space-y-4">
              <InfoPanel currentTurn={currentTurn} instruction={instruction} message={message} />
              <HistoryPanel history={history} title={t('history.title')} emptyState={t('history.empty')} />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
