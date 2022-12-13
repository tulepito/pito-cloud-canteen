import { authThunks } from '@redux/slices/auth.slice';
import { userThunks } from '@redux/slices/user.slice';
import type { AppDispatch, RootState } from '@redux/store';
import { useRouter } from 'next/router';
import type { PropsWithChildren } from 'react';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

type TAuthGuard = {
  isRequiredAuth: Boolean;
};

const AuthGuard: React.FC<PropsWithChildren<TAuthGuard>> = (props) => {
  const { authInfoLoaded, isAuthenticated } = useSelector(
    (state: RootState) => state.auth,
  );
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const { children, isRequiredAuth } = props;

  useEffect(() => {
    if (!authInfoLoaded) {
      dispatch(authThunks.authInfo());
    }

    dispatch(userThunks.fetchCurrentUser(undefined));
  }, [isRequiredAuth]);

  useEffect(() => {
    if (authInfoLoaded && !isAuthenticated && isRequiredAuth) {
      router.push('/dang-nhap');
    }
  }, [isRequiredAuth]);

  return <>{children}</>;
};

export default AuthGuard;
