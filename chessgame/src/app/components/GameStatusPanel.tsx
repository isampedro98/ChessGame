'use client';

import { useTranslation } from '@/app/i18n/TranslationProvider';
import { Team, type GameResult } from '@/domain/chess';

interface GameStatusPanelProps {
  currentTurn: Team;
  movesCount: number;
  maxMoves: number | null;
  onChangeMaxMoves: (value: number | null) => void;
  inCheck: boolean;
  isCheckmate: boolean;
  result: GameResult;
}

export function GameStatusPanel({
  currentTurn,
  movesCount,
  maxMoves,
  onChangeMaxMoves,
  inCheck,
  isCheckmate,
  result,
}: GameStatusPanelProps) {
  const { t } = useTranslation();

  const statusText = isCheckmate && result
    ? result === Team.White
      ? t('info.winner.whites')
      : t('info.winner.blacks')
    : result === 'DRAW'
    ? t('status.state.draw')
    : inCheck
    ? t('status.state.check')
    : t('status.state.active');

  const statusClass = isCheckmate
    ? 'border-rose-400/40 bg-rose-500/15 text-rose-200'
    : result === 'DRAW'
    ? 'border-cyan-400/40 bg-cyan-500/15 text-cyan-200'
    : inCheck
    ? 'border-amber-400/40 bg-amber-500/15 text-amber-200'
    : 'border-emerald-400/40 bg-emerald-500/15 text-emerald-200';

  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 text-sm text-slate-300">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">{t('status.title')}</h3>
        <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${statusClass}`}>{statusText}</span>
      </div>
      <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{t('info.currentTurn')}</p>
          <p className="mt-1 text-base font-semibold text-slate-100">{t(`team.${currentTurn.toLowerCase()}`)}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{t('status.moves')}</p>
          <p className="mt-1 text-base font-semibold text-slate-100">
            {movesCount} / {maxMoves ?? t('status.unlimited')}
          </p>
        </div>
        <label className="inline-flex items-center gap-2">
          <span className="text-xs uppercase tracking-[0.2em] text-slate-500">{t('status.maxMoves')}</span>
          <select
            value={maxMoves ?? ''}
            onChange={(e) => onChangeMaxMoves(e.target.value === '' ? null : Number(e.target.value))}
            className="rounded-md border border-slate-700 bg-slate-800 px-2 py-1 text-xs text-slate-100"
          >
            <option value="">{t('status.unlimited')}</option>
            <option value="40">40</option>
            <option value="50">{t('status.option.professional50')}</option>
            <option value="60">60</option>
            <option value="80">80</option>
          </select>
        </label>
      </div>
    </section>
  );
}
