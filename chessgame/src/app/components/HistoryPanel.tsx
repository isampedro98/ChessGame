'use client';

import type { HistoryEntry } from '@/app/hooks/useChessUI';
import { useTranslation } from '@/app/i18n/TranslationProvider';

interface HistoryPanelProps {
  history: HistoryEntry[];
  title: string;
  emptyState: string;
}

export const HistoryPanel = ({ history, title, emptyState }: HistoryPanelProps) => {
  const { t } = useTranslation();

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
      <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">{title}</h3>
      {history.length === 0 ? (
        <p className="mt-3 text-sm text-slate-500">{emptyState}</p>
      ) : (
        <ol className="mt-3 space-y-3 text-sm text-slate-300">
          {history.map(({ sequence, title: entryTitle, notes }) => (
            <li key={sequence} className="space-y-1">
              <div className="flex items-center justify-between gap-3">
                <span className="font-mono text-xs text-slate-500">#{sequence}</span>
                <span>{entryTitle}</span>
              </div>
              {notes.map((note, noteIndex) => (
                <p key={`${sequence}-${noteIndex}`} className="pl-6 text-xs text-slate-500">
                  {t(note.key, note.params)}
                </p>
              ))}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
};
