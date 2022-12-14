import '../styles/globals.scss';

import AdminLayout from '@components/AdminLayout/AdminLayout';
import AuthGuard from '@components/AuthGuard/AuthGuard';
import Layout from '@components/Layout/Layout';
import viMessage from '@translations/vi.json';
import type { NextApplicationPage } from '@utils/types';
import type { Router } from 'next/router';
import { useRouter } from 'next/router';
import type { ReactNode } from 'react';
import { IntlProvider } from 'react-intl';
import { Provider } from 'react-redux';

import reduxStore from '../redux/store';

const DEFAULT_LOCALE = 'vi-VN';

export default function App({
  Component,
  pageProps,
  router,
}: {
  Component: NextApplicationPage;
  pageProps: Record<string, any>;
  router: Router;
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

  const isAdminRoute = !!router.route.startsWith('/admin');
  const getLayout = isAdminRoute
    ? (page: ReactNode) => <AdminLayout>{page}</AdminLayout>
    : (page: ReactNode) => <Layout>{page}</Layout>;

  return (
    <IntlProvider
      locale={appLocale}
      defaultLocale={defaultLocale}
      messages={message}>
      <Provider store={reduxStore}>
        <AuthGuard isRequiredAuth={isRequiredAuth}>
          {getLayout(<Component {...pageProps} />)}
        </AuthGuard>
      </Provider>
    </IntlProvider>
  );
}
