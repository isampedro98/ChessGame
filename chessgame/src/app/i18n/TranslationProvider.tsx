"use client";

import { createContext, useContext, useMemo, useState } from 'react';

import { fallbackLocale, translations, type Locale } from './translations';

type TranslationParams = Record<string, string | number>;

type TranslationContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: TranslationParams) => string;
};

const TranslationContext = createContext<TranslationContextValue | null>(null);

const format = (template: string, params?: TranslationParams) => {
  if (!params) {
    return template;
  }
  return Object.keys(params).reduce((acc, key) =>
    acc.replace(new RegExp(`{${key}}`, 'g'), String(params[key]))
  , template);
};

export const TranslationProvider = ({ children }: { children: React.ReactNode }) => {
  const [locale, setLocale] = useState<Locale>(() => fallbackLocale);

  const value = useMemo<TranslationContextValue>(() => {
    const dictionary = translations[locale] ?? translations[fallbackLocale];
    return {
      locale,
      setLocale,
      t: (key, params) => format(dictionary[key] ?? key, params),
    };
  }, [locale]);

  return (
    <TranslationContext.Provider value={value}>{children}</TranslationContext.Provider>
  );
};

export const useTranslation = (): TranslationContextValue => {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
};
