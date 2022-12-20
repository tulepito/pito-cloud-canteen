import { useAppSelector } from '@redux/reduxHooks';
import paths from '@src/paths';
import { useRouter } from 'next/router';
import type { PropsWithChildren } from 'react';
import React, { useEffect } from 'react';

type TAuthGuard = {
  isRequiredAuth: boolean;
  isAuthenticationRoute: boolean;
};

const AuthGuard: React.FC<PropsWithChildren<TAuthGuard>> = (props) => {
  const router = useRouter();
  const authInfoLoaded = useAppSelector((state) => state.auth.authInfoLoaded);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  const { children, isRequiredAuth, isAuthenticationRoute } = props;

  useEffect(() => {
    if (authInfoLoaded) {
      if (isAuthenticationRoute && isAuthenticated) {
        router.push(paths.HomePage);
      }

      if (isRequiredAuth && !isAuthenticated) {
        router.push(paths.SignIn);
      }
    }
  }, [
    authInfoLoaded,
    isAuthenticated,
    isAuthenticationRoute,
    isRequiredAuth,
    router,
  ]);

  return <>{children}</>;
};

export default AuthGuard;
