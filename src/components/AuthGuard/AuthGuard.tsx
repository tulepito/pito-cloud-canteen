import { useAppDispatch, useAppSelector } from '@redux/reduxHooks';
import { authThunks } from '@redux/slices/auth.slice';
import { userThunks } from '@redux/slices/user.slice';
import { useRouter } from 'next/router';
import type { PropsWithChildren } from 'react';
import React, { useEffect } from 'react';

type TAuthGuard = {
  isRequiredAuth: boolean;
  isAuthenticationRoute: boolean;
};

const AuthGuard: React.FC<PropsWithChildren<TAuthGuard>> = (props) => {
  const { authInfoLoaded, isAuthenticated } = useAppSelector(
    (state) => state.auth,
  );
  const dispatch = useAppDispatch();
  const router = useRouter();

  const { children, isRequiredAuth, isAuthenticationRoute } = props;

  useEffect(() => {
    dispatch(authThunks.authInfo());

    if (isAuthenticated) {
      dispatch(userThunks.fetchCurrentUser(undefined));
    }
  }, [isAuthenticated]);

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
