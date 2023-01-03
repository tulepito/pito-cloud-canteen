import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { authThunks } from '@redux/slices/auth.slice';
import { emailVerificationActions } from '@redux/slices/emailVerification.slice';
import { currentUserSelector, userThunks } from '@redux/slices/user.slice';
import {
  generalPaths,
  IgnoredAuthCheckRoutes,
  NonRequireAuthenticationRoutes,
} from '@src/paths';
import { useRouter } from 'next/router';
import type { PropsWithChildren } from 'react';
import React, { useCallback, useEffect } from 'react';

type TAuthGuardProps = PropsWithChildren<{}>;

const AuthGuard: React.FC<TAuthGuardProps> = ({ children }) => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isAuthenticated, authInfoLoaded } = useAppSelector(
    (state) => state.auth,
  );
  const user = useAppSelector(currentUserSelector);

  const { pathname: pathName } = router;
  const {
    id: userId,
    attributes: { emailVerified: isUserEmailVerified },
  } = user;

  const isNonRequireAuthenticationRoute =
    NonRequireAuthenticationRoutes.includes(pathName);
  const isIgnoredAuthCheckRoute = IgnoredAuthCheckRoutes.includes(pathName);

  // TODO: check sign up path and consider showing verification email form or not
  const isSignUpPath = pathName === generalPaths.SignUp;
  const shouldShowEmailVerification = !!userId && !isUserEmailVerified;
  const shouldNavigateInSignUpFlow =
    isSignUpPath && !shouldShowEmailVerification;

  const homePageNavigateCondition =
    isAuthenticated &&
    isNonRequireAuthenticationRoute &&
    (!isSignUpPath || shouldNavigateInSignUpFlow);

  const verifyAuthentication = useCallback(() => {
    if (!isIgnoredAuthCheckRoute || !authInfoLoaded) {
      return;
    }

    if (isNonRequireAuthenticationRoute) {
      if (homePageNavigateCondition) {
        router.prefetch(generalPaths.Home);
        router.push(generalPaths.Home);
      }
    } else if (!isAuthenticated) {
      router.push(generalPaths.SignIn);
    }
  }, [
    authInfoLoaded,
    homePageNavigateCondition,
    isAuthenticated,
    isIgnoredAuthCheckRoute,
    isNonRequireAuthenticationRoute,
    router,
  ]);

  const renderComponent = () => {
    if (!isIgnoredAuthCheckRoute) {
      return children;
    }

    if (!authInfoLoaded) {
      return null;
    }

    if (isNonRequireAuthenticationRoute) {
      if (homePageNavigateCondition) {
        return null;
      }
    } else if (!isAuthenticated) {
      return null;
    }

    return children;
  };

  useEffect(() => {
    dispatch(authThunks.authInfo());
  }, [dispatch, pathName]);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(userThunks.fetchCurrentUser(undefined));
      const isVerified = isUserEmailVerified;
      dispatch(emailVerificationActions.updateVerificationState(isVerified));
    }
  }, [dispatch, isAuthenticated, isUserEmailVerified]);

  useEffect(() => {
    verifyAuthentication();
  }, [verifyAuthentication]);

  return <>{renderComponent()}</>;
};

export default AuthGuard;
