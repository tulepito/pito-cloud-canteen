import type { PropsWithChildren } from 'react';
import React, { useEffect, useState } from 'react';
import { IntlProvider } from 'react-intl';
import enLocale from 'date-fns/locale/en-US';
import viLocale from 'date-fns/locale/vi';

import enMessage from '@translations/en.json';
import viMessage from '@translations/vi.json';

export const DEFAULT_LOCALE = 'vi';

type Locale = 'en' | 'vi';

export const APP_LOCALES = ['en', 'vi'] as const;

export const getLocaleTimeProvider = (locale?: Locale | null) => {
  const mapper = {
    en: enLocale,
    vi: viLocale,
  };

  if (typeof window === 'undefined') {
    return mapper[DEFAULT_LOCALE];
  }

  if (!locale) {
    const storedLocale = localStorage.getItem('locale') as Locale | null;
    if (storedLocale && APP_LOCALES.includes(storedLocale)) {
      return mapper[storedLocale];
    }

    return mapper[DEFAULT_LOCALE];
  }

  return mapper[locale] || mapper[DEFAULT_LOCALE];
};

export const useLocaleTimeProvider = () => {
  const [localeTimeProvider, setLocaleTimeProvider] = useState(
    getLocaleTimeProvider(DEFAULT_LOCALE),
  );
  const currentLocale = 'vi';

  /**
   * Check if the locale is stored in localStorage and set it as the current locale
   */
  useEffect(() => {
    const storedLocale = localStorage.getItem('locale') as Locale | null;
    if (storedLocale && APP_LOCALES.includes(storedLocale)) {
      setLocaleTimeProvider(getLocaleTimeProvider(storedLocale));
    }
  }, [currentLocale]);

  return localeTimeProvider;
};

export const getCurrentLocaleFromLocalStorage = () => {
  if (typeof window === 'undefined') {
    return DEFAULT_LOCALE;
  }
  const storedLocale = localStorage.getItem('locale') as Locale | null;
  if (storedLocale && APP_LOCALES.includes(storedLocale)) {
    return storedLocale;
  }

  return DEFAULT_LOCALE;
};

const LangContext = React.createContext<{
  lang: 'en' | 'vi';
}>({
  lang: DEFAULT_LOCALE,
});

export const useLang = () => {
  const lang = React.useContext(LangContext);

  return lang;
};

const TranslationProvider = ({
  children,
  lang,
}: PropsWithChildren<{
  lang?: 'en' | 'vi';
}>) => {
  let message;
  switch (lang) {
    case 'vi':
      message = viMessage;
      break;
    case 'en':
      message = enMessage;
      break;
    default:
      message = viMessage;
      break;
  }

  return (
    <IntlProvider
      textComponent={'span'}
      locale={lang || DEFAULT_LOCALE}
      defaultLocale={DEFAULT_LOCALE}
      messages={message}>
      <LangContext.Provider value={{ lang: lang || DEFAULT_LOCALE }}>
        {children}
      </LangContext.Provider>
    </IntlProvider>
  );
};

export default TranslationProvider;
