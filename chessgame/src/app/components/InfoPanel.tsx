'use client';

import { useTranslation } from '@/app/i18n/TranslationProvider';

interface InfoPanelProps {
  instruction: string;
  message: string | null;
  trainingFeedback?: { tone: 'good' | 'ok' | 'warn' | 'bad'; text: string } | null;
  onNewGame: () => void;
  onExportGame: () => void;
  onImportGame: () => void;
  onPlayBot: () => void;
  onUndoMove: () => void;
  canUndo?: boolean;
  botEnabled?: boolean;
}

export const InfoPanel = ({
  instruction,
  message,
  trainingFeedback,
  onNewGame,
  onExportGame,
  onImportGame,
  onPlayBot,
  onUndoMove,
  canUndo = false,
  botEnabled = false,
}: InfoPanelProps) => {
  const { t } = useTranslation();

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-4 text-sm text-slate-300">
      <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">{t('actions.title')}</h3>

      <div className="mt-3 grid gap-3 md:grid-cols-3">
        <div className="rounded-md border border-slate-800 bg-slate-900/60 p-3">
          <p className="mb-2 text-xs uppercase tracking-[0.2em] text-slate-500">{t('actions.group.flow')}</p>
          <div className="flex flex-wrap gap-2">
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
          </div>
        </div>

        <div className="rounded-md border border-slate-800 bg-slate-900/60 p-3">
          <p className="mb-2 text-xs uppercase tracking-[0.2em] text-slate-500">{t('actions.group.training')}</p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={onPlayBot}
              aria-pressed={botEnabled}
              className={`rounded-md px-3 py-1.5 text-xs ${botEnabled ? 'bg-emerald-700 text-white hover:bg-emerald-600' : 'bg-slate-800 text-slate-100 hover:bg-slate-700'}`}
            >
              {botEnabled ? (t('menu.playBotOn') || 'Training: ON') : (t('menu.playBot') || 'Train vs AI')}
            </button>
          </div>
        </div>

        <div className="rounded-md border border-slate-800 bg-slate-900/60 p-3">
          <p className="mb-2 text-xs uppercase tracking-[0.2em] text-slate-500">{t('actions.group.data')}</p>
          <div className="flex flex-wrap gap-2">
            <button onClick={onExportGame} className="rounded-md bg-slate-800 px-3 py-1.5 text-xs text-slate-100 hover:bg-slate-700">{t('menu.exportGame') || 'Export Game'}</button>
            <button onClick={onImportGame} className="rounded-md bg-slate-800 px-3 py-1.5 text-xs text-slate-100 hover:bg-slate-700">{t('menu.import') || 'Import'}</button>
          </div>
        </div>
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
