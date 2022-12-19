import { useRouter } from 'next/router';
import type { PropsWithChildren } from 'react';
import React, { useEffect } from 'react';

type TAuthGuard = {
  isRequiredAuth: boolean;
  isAuthenticationRoute: boolean;
  isAuthenticated: boolean;
  authInfoLoaded: boolean;
};

const AuthGuard: React.FC<PropsWithChildren<TAuthGuard>> = (props) => {
  const router = useRouter();

  const {
    children,
    isRequiredAuth,
    isAuthenticationRoute,
    isAuthenticated,
    authInfoLoaded,
  } = props;

  useEffect(() => {
    if (authInfoLoaded) {
      if (isAuthenticationRoute && isAuthenticated) {
        router.push('/');
      }

      if (isRequiredAuth) {
        if (!isAuthenticated) router.push('/dang-nhap');
      }
    }
  }, [authInfoLoaded, isAuthenticated]);

  return <>{children}</>;
};

export default AuthGuard;
