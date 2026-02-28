'use client';

import { useState } from 'react';

import { useTranslation } from '@/app/i18n/TranslationProvider';

type GameSummary = {
  id: string;
  moves: number;
  capturedWhite: number;
  capturedBlack: number;
  winner: 'WHITE' | 'BLACK' | null;
  startedAt: string;
  endedAt: string | null;
  pgn?: string;
  finalFen?: string;
};

export type Stats = {
  schemaVersion: number;
  totalGames: number;
  winsWhite: number;
  winsBlack: number;
  games: GameSummary[];
};

export function StatsPanel({ stats, onExport }: { stats: Stats; onExport: () => void }) {
  const { t } = useTranslation();
  const [collapsed, setCollapsed] = useState(false);
  const lastGames = [...stats.games].slice(-5).reverse();
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
      <div className="mb-2 flex items-center justify-between gap-3">
        <h3 className="text-base font-semibold text-slate-200">{t('stats.title')}</h3>
        <button
          type="button"
          aria-expanded={!collapsed}
          onClick={() => setCollapsed((value) => !value)}
          className="rounded-md border border-slate-700 bg-slate-800 px-2 py-1 text-xs text-slate-200 hover:bg-slate-700"
        >
          {collapsed ? t('panel.toggle.show') : t('panel.toggle.hide')}
        </button>
      </div>
      {!collapsed ? (
        <>
          <div className="mb-3">
            <button onClick={onExport} className="rounded-md bg-slate-800 px-3 py-1.5 text-xs text-slate-100 hover:bg-slate-700">{t('menu.exportStats')}</button>
          </div>
          <div className="mb-3 grid grid-cols-3 gap-2 text-sm">
            <div className="rounded-md bg-slate-800/60 p-2">
              <div className="text-slate-400">{t('stats.totalGames')}</div>
              <div className="text-slate-100">{stats.totalGames}</div>
            </div>
            <div className="rounded-md bg-slate-800/60 p-2">
              <div className="text-slate-400">{t('stats.whiteWins')}</div>
              <div className="text-slate-100">{stats.winsWhite}</div>
            </div>
            <div className="rounded-md bg-slate-800/60 p-2">
              <div className="text-slate-400">{t('stats.blackWins')}</div>
              <div className="text-slate-100">{stats.winsBlack}</div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-sm font-medium text-slate-300">{t('stats.recentGames')}</div>
            {lastGames.length === 0 ? (
              <div className="text-sm text-slate-500">{t('stats.empty')}</div>
            ) : (
              <ul className="space-y-1">
                {lastGames.map((g) => (
                  <li key={g.id} className="rounded-md bg-slate-800/40 px-2 py-1.5 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">{g.startedAt.slice(0,10)} - {g.moves} {t('stats.moves')}</span>
                      <span className="text-slate-400">W:{g.capturedWhite} / B:{g.capturedBlack}</span>
                      <span className="text-slate-200">{g.winner ?? 'DRAW'}</span>
                    </div>
                    {g.pgn ? (
                      <div className="mt-1 flex gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            const pre = document.createElement('pre');
                            pre.style.display = 'none';
                            pre.textContent = g.pgn ?? '';
                            document.body.appendChild(pre);
                            const range = document.createRange();
                            range.selectNode(pre);
                            window.getSelection()?.removeAllRanges();
                            window.getSelection()?.addRange(range);
                            document.execCommand('copy');
                            document.body.removeChild(pre);
                          }}
                          className="text-xs text-slate-400 hover:text-slate-200 underline"
                        >
                          {t('stats.pgn.copy')}
                        </button>
                        <details className="text-xs">
                          <summary className="cursor-pointer text-slate-400 hover:text-slate-200">{t('stats.pgn.show')}</summary>
                          <pre className="mt-1 max-h-32 overflow-auto whitespace-pre-wrap break-all rounded bg-slate-900/60 p-2 text-slate-300">{g.pgn}</pre>
                        </details>
                      </div>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}
