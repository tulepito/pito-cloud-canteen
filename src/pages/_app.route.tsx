import '@src/styles/globals.scss';
import '@src/styles/nprogress.scss';
import 'react-loading-skeleton/dist/skeleton.css';

import AuthGuard from '@components/Guards/AuthGuard';
import PermissionGuard from '@components/Guards/PermissionGuard';
import store from '@redux/store';
import TranslationProvider from '@translations/TranslationProvider';
import type { NextApplicationPage } from '@utils/types';
import type { AppProps } from 'next/app';
import { Router } from 'next/router';
import Script from 'next/script';
import nProgress from 'nprogress';
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
  return (
    <TranslationProvider>
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places&callback=Function.prototype`}
      />
      <Provider store={store}>
        <AuthGuard>
          <PermissionGuard>
            <Component {...restProps.pageProps} key={router.asPath} />
          </PermissionGuard>
        </AuthGuard>
      </Provider>
    </TranslationProvider>
  );
};

export default MyApp;
