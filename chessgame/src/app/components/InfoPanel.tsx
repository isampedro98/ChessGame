'use client';

import { useTranslation } from '@/app/i18n/TranslationProvider';
import { Team } from '@/domain/chess';
import React from 'react';

interface InfoPanelProps {
  currentTurn: Team;
  instruction: string;
  message: string | null;
  trainingFeedback?: { tone: 'good' | 'ok' | 'warn' | 'bad'; text: string } | null;
  movesCount: number;
  maxMoves: number | null;
  onChangeMaxMoves: (value: number | null) => void;
  onNewGame: () => void;
  onExportGame: () => void;
  onImportGame: () => void;
  onPlayBot: () => void;
  onUndoMove: () => void;
  canUndo?: boolean;
  botEnabled?: boolean;
}

export const InfoPanel = ({ currentTurn, instruction, message, trainingFeedback, movesCount, maxMoves, onChangeMaxMoves, onNewGame, onExportGame, onImportGame, onPlayBot, onUndoMove, canUndo = false, botEnabled = false }: InfoPanelProps) => {
  const { t } = useTranslation();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-4 text-sm text-slate-300">
      <p>
        {t('info.currentTurn')}:
        <span className="ml-1 font-semibold text-slate-100">{t(`team.${currentTurn.toLowerCase()}`)}</span>
      </p>
      <p className="mt-1 text-slate-400">
        Moves: <span className="text-slate-200">{mounted ? movesCount : 0}</span>
        <span className="text-slate-200"> / {mounted ? (maxMoves ?? '∞') : '∞'}</span>
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <label className="inline-flex items-center gap-2">
          <span className="text-slate-400">Max moves:</span>
          <select
            value={maxMoves ?? ''}
            onChange={(e) => onChangeMaxMoves(e.target.value === '' ? null : Number(e.target.value))}
            className="rounded-md bg-slate-800 px-2 py-1 text-slate-100"
          >
            <option value="">Unlimited</option>
            <option value="50">50 (professional max)</option>
            <option value="40">40</option>
            <option value="60">60</option>
            <option value="80">80</option>
            <option value="100">100</option>
          </select>
        </label>
        <button onClick={onNewGame} className="rounded-md bg-slate-800 px-3 py-1.5 text-xs text-slate-100 hover:bg-slate-700">{t('menu.newGame') || 'New Game'}</button>
        <button
          type="button"
          onClick={onUndoMove}
          disabled={!canUndo}
          className={`rounded-md px-3 py-1.5 text-xs ${
            canUndo
              ? 'bg-slate-800 text-slate-100 hover:bg-slate-700'
              : 'cursor-not-allowed bg-slate-900 text-slate-600'
          }`}
        >
          {t('menu.undo') || 'Undo'}
        </button>
        <button onClick={onExportGame} className="rounded-md bg-slate-800 px-3 py-1.5 text-xs text-slate-100 hover:bg-slate-700">{t('menu.exportGame') || 'Export Game'}</button>
        <button onClick={onImportGame} className="rounded-md bg-slate-800 px-3 py-1.5 text-xs text-slate-100 hover:bg-slate-700">{t('menu.import') || 'Import'}</button>
        <button
          onClick={onPlayBot}
          aria-pressed={botEnabled}
          className={`rounded-md px-3 py-1.5 text-xs ${botEnabled ? 'bg-emerald-700 text-white hover:bg-emerald-600' : 'bg-slate-800 text-slate-100 hover:bg-slate-700'}`}
        >
          {botEnabled ? (t('menu.playBotOn') || 'Training: ON') : (t('menu.playBot') || 'Train vs AI')}
        </button>
      </div>
      <p className="mt-3 text-slate-400">{instruction}</p>
      {message ? (
        <p className="mt-2 rounded bg-amber-400/10 px-3 py-2 text-amber-200">{message}</p>
      ) : null}
      {trainingFeedback ? (
        <p
          className={`mt-2 rounded px-3 py-2 ${
            trainingFeedback.tone === 'good'
              ? 'bg-emerald-400/10 text-emerald-200'
              : trainingFeedback.tone === 'warn'
              ? 'bg-amber-400/10 text-amber-200'
              : trainingFeedback.tone === 'bad'
              ? 'bg-rose-500/10 text-rose-200'
              : 'bg-slate-800/50 text-slate-200'
          }`}
        >
          {trainingFeedback.text}
        </p>
      ) : null}
    </div>
  );
};
