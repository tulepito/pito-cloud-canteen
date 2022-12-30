/* eslint-disable no-nested-ternary */
import '@src/styles/globals.scss';
import '@src/styles/nprogress.scss';

import AuthGuard from '@components/Guards/AuthGuard';
import PermissionGuard from '@components/Guards/PermissionGuard';
import { Manrope } from '@next/font/google';
import wrapper from '@redux/store';
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

const font = Manrope({
  subsets: ['vietnamese', 'latin'],
  weight: ['400', '500', '700'],
});

const MyApp = ({
  Component,
  router,
  ...restProps
}: AppProps & AppCustomProps) => {
  const { store, props } = wrapper.useWrappedStore(restProps);
  if (typeof window !== 'undefined')
    localStorage.setItem(
      'persist:root',
      JSON.stringify(store.getState().Order),
    );

  return (
    <main className={font.className}>
      <TranslationProvider>
        <Script
          src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`}
        />
        <Provider store={store}>
          <AuthGuard>
            <PermissionGuard>
              <Component {...props.pageProps} key={router.asPath} />
            </PermissionGuard>
          </AuthGuard>
        </Provider>
      </TranslationProvider>
    </main>
  );
};

export default MyApp;
