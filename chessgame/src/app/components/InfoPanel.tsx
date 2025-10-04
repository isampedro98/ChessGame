'use client';

import { useTranslation } from '@/app/i18n/TranslationProvider';
import { Team } from '@/domain/chess';

interface InfoPanelProps {
  currentTurn: Team;
  instruction: string;
  message: string | null;
}

export const InfoPanel = ({ currentTurn, instruction, message }: InfoPanelProps) => {
  const { t } = useTranslation();

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-4 text-sm text-slate-300">
      <p>
        {t('info.currentTurn')}:
        <span className="ml-1 font-semibold text-slate-100">{t(`team.${currentTurn.toLowerCase()}`)}</span>
      </p>
      <p className="mt-3 text-slate-400">{instruction}</p>
      {message ? (
        <p className="mt-2 rounded bg-amber-400/10 px-3 py-2 text-amber-200">{message}</p>
      ) : null}
    </div>
  );
};
