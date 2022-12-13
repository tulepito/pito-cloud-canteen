import '../styles/globals.scss';

import AdminLayout from '@components/AdminLayout/AdminLayout';
import viMessage from '@translations/vi.json';
import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import type { ReactNode } from 'react';
import { IntlProvider } from 'react-intl';
import { Provider } from 'react-redux';

import reduxStore from '../redux/store';

const DEFAULT_LOCALE = 'vi-VN';

export default function App({ Component, pageProps, router }: AppProps) {
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

  const isAdminRoute = !!router.route.startsWith('/admin');
  const getLayout = isAdminRoute
    ? (page: ReactNode) => <AdminLayout>{page}</AdminLayout>
    : (page: ReactNode) => <>{page}</>;

  return (
    <IntlProvider
      locale={appLocale}
      defaultLocale={defaultLocale}
      messages={message}>
      <Provider store={reduxStore}>
        {getLayout(<Component {...pageProps} />)}
      </Provider>
    </IntlProvider>
  );
}
