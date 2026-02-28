'use client';

import { useState } from 'react';

import { useTranslation } from '@/app/i18n/TranslationProvider';

const FIDE_RULES_URL = 'https://handbook.fide.com/chapter/E012023';

export function RulesPanel() {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);

  const items = [
    { title: t('rules.goal.title'), body: t('rules.goal.body') },
    { title: t('rules.legality.title'), body: t('rules.legality.body') },
    { title: t('rules.opening.title'), body: t('rules.opening.body') },
    { title: t('rules.filter.title'), body: t('rules.filter.body') },
    { title: t('rules.endgame.title'), body: t('rules.endgame.body') },
  ];

  return (
    <section className="rounded-xl border border-cyan-400/30 bg-cyan-500/10 p-4 text-sm text-cyan-50">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold">{t('rules.title')}</h3>
          <p className="mt-1 text-xs text-cyan-100/80">{t('rules.subtitle')}</p>
        </div>
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          aria-expanded={expanded}
          className="rounded-md border border-cyan-300/40 bg-cyan-400/20 px-2 py-1 text-xs font-medium text-cyan-50 hover:bg-cyan-400/30"
        >
          {expanded ? t('rules.toggle.hide') : t('rules.toggle.show')}
        </button>
      </div>

      {expanded ? (
        <div className="mt-3 space-y-2">
          {items.map((item) => (
            <div key={item.title} className="rounded-md bg-slate-950/35 px-3 py-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-cyan-100">{item.title}</p>
              <p className="mt-1 text-xs text-cyan-50/90">{item.body}</p>
            </div>
          ))}
          <div className="rounded-md border border-cyan-300/30 bg-cyan-900/25 px-3 py-2">
            <p className="text-xs text-cyan-100">{t('rules.official.label')}</p>
            <a
              href={FIDE_RULES_URL}
              target="_blank"
              rel="noreferrer noopener"
              className="text-xs font-semibold text-cyan-200 underline underline-offset-2 hover:text-cyan-100"
            >
              {t('rules.official.link')}
            </a>
          </div>
        </div>
      ) : null}
    </section>
  );
}

