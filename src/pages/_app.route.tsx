import '../styles/globals.scss';

import AdminLayout from '@components/AdminLayout/AdminLayout';
import AuthGuard from '@components/AuthGuard/AuthGuard';
import Layout from '@components/Layout/Layout';
import { authThunks } from '@redux/slices/auth.slice';
import { emailVerificationActions } from '@redux/slices/emailVerification.slice';
import { userThunks } from '@redux/slices/user.slice';
import wrapper from '@redux/store';
import { AuthenticationRoutes } from '@src/paths';
import TranslationProvider from '@translations/TranslationProvider';
import type { NextApplicationPage } from '@utils/types';
import type { AppContext, AppInitialProps, AppProps } from 'next/app';
import App from 'next/app';
import { Provider } from 'react-redux';

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

  const isRequiredAuth = Component.requireAuth === true;

  const isAdminRoute = !!router.route.startsWith('/admin');
  const isAuthenticationRoute = AuthenticationRoutes.includes(router.route);
  const LayoutComponent = isAdminRoute ? AdminLayout : Layout;

  return (
    <TranslationProvider>
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
