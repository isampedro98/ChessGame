"use client";

import { useTranslation } from '@/app/i18n/TranslationProvider';

export const LanguageSwitcher = () => {
  const { locale, setLocale, t } = useTranslation();
  const nextLocale = locale === 'en' ? 'es' : 'en';

  return (
    <button
      type="button"
      className="rounded-md border border-slate-700 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-slate-400 transition hover:border-slate-500 hover:text-slate-200"
      onClick={() => setLocale(nextLocale)}
    >
      {t('controls.language')}: {t('controls.language.switch', { next: nextLocale.toUpperCase() })}
    </button>
  );
};
