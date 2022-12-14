import '../styles/globals.scss';

import AuthGuard from '@components/AuthGuard/AuthGuard';
import Layout from '@components/Layout/Layout';
import viMessage from '@translations/vi.json';
import type { NextApplicationPage } from '@utils/types';
import { useRouter } from 'next/router';
import { IntlProvider } from 'react-intl';
import { Provider } from 'react-redux';

import reduxStore from '../redux/store';

const DEFAULT_LOCALE = 'vi-VN';

export default function App({
  Component,
  pageProps,
}: {
  Component: NextApplicationPage;
  pageProps: Record<string, any>;
}) {
  const { locale, defaultLocale } = useRouter();
  const isRequiredAuth = Component.requireAuth === true;

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
        <AuthGuard isRequiredAuth={isRequiredAuth}>
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </AuthGuard>
      </Provider>
    </IntlProvider>
  );
}
