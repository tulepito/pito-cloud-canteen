import '../styles/globals.scss';

import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import React from 'react';
import { IntlProvider } from 'react-intl';
import { Provider } from 'react-redux';

import viMessage from '../../content/locale/vi.json';
import reduxStore from '../redux/store';

const DEFAULT_LOCALE = 'vi';

export default function App({ Component, pageProps }: AppProps) {
  const { locale, defaultLocale } = useRouter();
  const appLocal = locale || DEFAULT_LOCALE;
  let message;

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
      locale={appLocal}
      defaultLocale={defaultLocale}
      messages={message}>
      <Provider store={reduxStore}>
        <Component {...pageProps} />
      </Provider>
    </IntlProvider>
  );
}
