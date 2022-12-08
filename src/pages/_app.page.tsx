import '../styles/globals.scss';

import viMessage from '@translations/vi.json';
import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import React from 'react';
import { IntlProvider } from 'react-intl';
import { Provider } from 'react-redux';

import reduxStore from '../redux/store';

const DEFAULT_LOCALE = 'vi-VN';

export default function App({ Component, pageProps }: AppProps) {
  const { locale, defaultLocale } = useRouter();
  const appLocale = locale || DEFAULT_LOCALE;
  let message;

  switch (appLocale) {
    case 'vi':
      message = viMessage;
      break;
    default:
      message = viMessage;
      break;
  }

  return (
    <IntlProvider
      locale={appLocale}
      defaultLocale={defaultLocale}
      messages={message}>
      <Provider store={reduxStore}>
        <Component {...pageProps} />
      </Provider>
    </IntlProvider>
  );
}
