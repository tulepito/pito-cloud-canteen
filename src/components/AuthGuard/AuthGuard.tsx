import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { authThunks } from '@redux/slices/auth.slice';
import { emailVerificationActions } from '@redux/slices/emailVerification.slice';
import { currentUserSelector, userThunks } from '@redux/slices/user.slice';
import paths from '@src/paths';
import { useRouter } from 'next/router';
import type { PropsWithChildren } from 'react';
import React, { useEffect } from 'react';

type TAuthGuard = {
  pathName: string;
  isRequiredAuth: boolean;
  isAuthenticationRoute: boolean;
};

const AuthGuard: React.FC<PropsWithChildren<TAuthGuard>> = (props) => {
  const { children, isRequiredAuth, isAuthenticationRoute, pathName } = props;
  const router = useRouter();
  const { isAuthenticated, authInfoLoaded } = useAppSelector(
    (state) => state.auth,
  );
  const user = useAppSelector(currentUserSelector);
  const dispatch = useAppDispatch();

  const showEmailVerification = !!user.id && !user.attributes.emailVerified;
  const isSignUpPath = pathName.includes(paths.SignUp);
  const shouldNavigateIfInSignUpFlow = isSignUpPath && !showEmailVerification;

  const homePageNavigateCondition =
    isAuthenticated &&
    isAuthenticationRoute &&
    (!isSignUpPath || shouldNavigateIfInSignUpFlow);

  useEffect(() => {
    dispatch(authThunks.authInfo());

    if (isAuthenticated) {
      dispatch(userThunks.fetchCurrentUser(undefined));
      const isVerified = user?.attributes?.emailVerified;
      dispatch(emailVerificationActions.updateVerificationState(isVerified));
    }
  }, [dispatch, isAuthenticated, user?.attributes?.emailVerified]);

  useEffect(() => {
    if (authInfoLoaded) {
      if (homePageNavigateCondition) {
        router.push(paths.HomePage);
      }

      if (isRequiredAuth && !isAuthenticated) {
        router.push(paths.SignIn);
      }
    }
  }, [
    authInfoLoaded,
    isAuthenticationRoute,
    isAuthenticated,
    isRequiredAuth,
    router,
    homePageNavigateCondition,
  ]);

  return <>{children}</>;
};

export default AuthGuard;
