/* eslint-disable no-nested-ternary */
import '@src/styles/globals.scss';
import '@src/styles/nprogress.scss';

import AdminLayout from '@components/AdminLayout/AdminLayout';
import AuthGuard from '@components/AuthGuard/AuthGuard';
import CompanyLayout from '@components/CompanyLayout/CompanyLayout';
import Layout from '@components/Layout/Layout';
import { Open_Sans } from '@next/font/google';
import wrapper from '@redux/store';
import { AuthenticationRoutes } from '@src/paths';
import TranslationProvider from '@translations/TranslationProvider';
import type { NextApplicationPage } from '@utils/types';
import type { AppProps } from 'next/app';
import { Router } from 'next/router';
import Script from 'next/script';
import nProgress from 'nprogress';
import React from 'react';
import { Provider } from 'react-redux';

Router.events.on('routeChangeStart', nProgress.start);
Router.events.on('routeChangeError', nProgress.done);
Router.events.on('routeChangeComplete', nProgress.done);

type AppCustomProps = {
  isAuthenticated: boolean;
  authInfoLoaded: boolean;
  Component?: NextApplicationPage;
};

const openSans = Open_Sans({
  subsets: ['vietnamese', 'latin'],
  weight: ['400', '500', '700'],
});

const MyApp = ({
  Component,
  router,
  ...restProps
}: AppProps & AppCustomProps) => {
  const { store, props } = wrapper.useWrappedStore(restProps);

  const isRequiredAuth = Component.requireAuth === true;

  const isAdminRoute = !!router.route.startsWith('/admin');
  const isAuthenticationRoute = AuthenticationRoutes.includes(router.route);
  const isCompanyRoute = !!router.route.startsWith('/company');
  const LayoutComponent = isAdminRoute
    ? AdminLayout
    : isCompanyRoute
    ? CompanyLayout
    : Layout;
  return (
    <main className={openSans.className}>
      <TranslationProvider>
        <Script
          src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`}
        />
        <Provider store={store}>
          <AuthGuard
            pathName={router.route}
            isAuthenticationRoute={isAuthenticationRoute}
            isRequiredAuth={isRequiredAuth}>
            <LayoutComponent>
              <Component {...props.pageProps} key={router.asPath} />
            </LayoutComponent>
          </AuthGuard>
        </Provider>
      </TranslationProvider>
    </main>
  );
};

export default MyApp;
