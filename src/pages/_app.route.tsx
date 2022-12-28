/* eslint-disable no-nested-ternary */
import '@src/styles/globals.scss';
import '@src/styles/nprogress.scss';

import AuthGuard from '@components/Guards/AuthGuard';
import PermissionGuard from '@components/Guards/PermissionGuard';
import { authThunks } from '@redux/slices/auth.slice';
import { emailVerificationActions } from '@redux/slices/emailVerification.slice';
import { userThunks } from '@redux/slices/user.slice';
import wrapper from '@redux/store';
import TranslationProvider from '@translations/TranslationProvider';
import type { NextApplicationPage } from '@utils/types';
import type { AppContext, AppInitialProps, AppProps } from 'next/app';
import App from 'next/app';
import { Router } from 'next/router';
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

const MyApp = ({
  Component,
  router,
  ...restProps
}: AppProps & AppCustomProps) => {
  const { store, props } = wrapper.useWrappedStore(restProps);

  return (
    <TranslationProvider>
      <Provider store={store}>
        <AuthGuard>
          <PermissionGuard>
            <Component {...props.pageProps} key={router.asPath} />
          </PermissionGuard>
        </AuthGuard>
      </Provider>
    </TranslationProvider>
  );
};

MyApp.getInitialProps = wrapper.getInitialAppProps(
  (store) =>
    async (_context: AppContext): Promise<AppInitialProps> => {
      await store.dispatch(authThunks.authInfo());
      const {
        auth: { isAuthenticated },
      } = store.getState();

      if (isAuthenticated) {
        await store.dispatch(userThunks.fetchCurrentUser(undefined));
        const {
          user: { currentUser },
        } = store.getState();
        const isVerified = currentUser?.attributes?.emailVerified;

        await store.dispatch(
          emailVerificationActions.updateVerificationState(isVerified),
        );
      }

      return App.getInitialProps(_context);
    },
);

export default MyApp;
