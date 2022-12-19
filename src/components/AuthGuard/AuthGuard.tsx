import { useRouter } from 'next/router';
import type { PropsWithChildren } from 'react';
import React, { useEffect } from 'react';

type TAuthGuard = {
  isRequiredAuth: boolean;
  isAuthenticationRoute: boolean;
  isAuthenticated: boolean;
};

const AuthGuard: React.FC<PropsWithChildren<TAuthGuard>> = (props) => {
  const router = useRouter();

  const { children, isRequiredAuth, isAuthenticationRoute, isAuthenticated } =
    props;

  useEffect(() => {
    if (isAuthenticationRoute && isAuthenticated) {
      router.push('/');
    }

    if (isRequiredAuth) {
      if (!isAuthenticated) router.push('/dang-nhap');
    }
  }, [isAuthenticated]);

  return <>{children}</>;
};

export default AuthGuard;
