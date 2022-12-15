import { authThunks } from '@redux/slices/auth.slice';
import { userThunks } from '@redux/slices/user.slice';
import type { AppDispatch, RootState } from '@redux/store';
import { useRouter } from 'next/router';
import type { PropsWithChildren } from 'react';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

type TAuthGuard = {
  isRequiredAuth: boolean;
  isAuthenticationRoute: boolean;
};

const AuthGuard: React.FC<PropsWithChildren<TAuthGuard>> = (props) => {
  const { authInfoLoaded, isAuthenticated } = useSelector(
    (state: RootState) => state.auth,
  );
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const { children, isRequiredAuth, isAuthenticationRoute } = props;

  useEffect(() => {
    if (!authInfoLoaded) {
      dispatch(authThunks.authInfo());
    }

    if (isRequiredAuth) {
      dispatch(userThunks.fetchCurrentUser(undefined));
    }
  }, [isRequiredAuth]);

  useEffect(() => {
    if (authInfoLoaded && !isAuthenticated && isRequiredAuth) {
      router.push('/dang-nhap');
    }

    if (isAuthenticationRoute && authInfoLoaded && isAuthenticated) {
      router.push('/');
    }
  }, [authInfoLoaded]);

  return <>{children}</>;
};

export default AuthGuard;
