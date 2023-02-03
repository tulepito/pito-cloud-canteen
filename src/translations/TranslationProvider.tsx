import viMessage from '@translations/vi.json';
import { useRouter } from 'next/router';
import type { PropsWithChildren } from 'react';
import React from 'react';
import { IntlProvider } from 'react-intl';

export const DEFAULT_LOCALE = 'vi';

const TranslationProvider = ({ children }: PropsWithChildren<{}>) => {
  let message;
  const { locale = DEFAULT_LOCALE, defaultLocale } = useRouter();
  switch (locale) {
    case 'vi':
      message = viMessage;
      break;
    default:
      message = viMessage;
      break;
  }

  return (
    <IntlProvider
      locale={locale}
      defaultLocale={defaultLocale}
      textComponent="span"
      messages={message}>
      {children}
    </IntlProvider>
  );
};

export default TranslationProvider;
