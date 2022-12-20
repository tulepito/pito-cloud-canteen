import '../styles/globals.scss';

import AdminLayout from '@components/AdminLayout/AdminLayout';
import AuthGuard from '@components/AuthGuard/AuthGuard';
import CompanyLayout from '@components/CompanyLayout/CompanyLayout';
import Layout from '@components/Layout/Layout';
import { authThunks } from '@redux/slices/auth.slice';
import { userThunks } from '@redux/slices/user.slice';
import wrapper from '@redux/store';
import viMessage from '@translations/vi.json';
import type { NextApplicationPage } from '@utils/types';
import type { AppContext, AppInitialProps, AppProps } from 'next/app';
import App from 'next/app';
import { useRouter } from 'next/router';
import type { ReactNode } from 'react';
import React from 'react';
import { IntlProvider } from 'react-intl';
import { Provider } from 'react-redux';

const DEFAULT_LOCALE = 'vi-VN';
const AuthenticationRoutes = ['/dang-nhap', '/dang-ky', '/quen-mat-khau'];

type AppCustomProps = {
  isAuthenticated: boolean;
  authInfoLoaded: boolean;
  Component?: NextApplicationPage;
};

const MyApp = ({
  Component,
  router,
  isAuthenticated,
  authInfoLoaded,
  ...restProps
}: AppProps & AppCustomProps) => {
  const { store, props } = wrapper.useWrappedStore(restProps);

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
  const isAuthenticationRoute = AuthenticationRoutes.includes(router.route);
  const isCompanyRoute = !!router.route.startsWith('/company');
  // const getLayout = isAdminRoute
  //   ? (page: ReactNode) => <AdminLayout>{page}</AdminLayout>
  //   : (page: ReactNode) => <>{page}</>;

  const getLayout = (page: ReactNode) => {
    if (isAdminRoute) {
      return <AdminLayout>{page}</AdminLayout>;
    }
    if (isCompanyRoute) {
      return <CompanyLayout>{page}</CompanyLayout>;
    }
    return <Layout>{page}</Layout>;
  };
  return (
    <IntlProvider
      locale={appLocale}
      defaultLocale={defaultLocale}
      messages={message}>
      <Provider store={store}>
        <AuthGuard
          authInfoLoaded={authInfoLoaded}
          isAuthenticated={isAuthenticated}
          isAuthenticationRoute={isAuthenticationRoute}
          isRequiredAuth={isRequiredAuth}>
          {getLayout(<Component {...props.pageProps} key={router.asPath} />)}
        </AuthGuard>
      </Provider>
    </IntlProvider>
  );
};

MyApp.getInitialProps = wrapper.getInitialAppProps(
  (store) =>
    async (_context: AppContext): Promise<AppInitialProps & AppCustomProps> => {
      await store.dispatch(authThunks.authInfo());
      const { isAuthenticated, authInfoLoaded } = store.getState().auth;

      if (isAuthenticated) {
        await store.dispatch(userThunks.fetchCurrentUser(undefined));
      }

      const ctx = await App.getInitialProps(_context);

      return {
        ...ctx,
        isAuthenticated,
        authInfoLoaded,
      };
    },
);

export default MyApp;
