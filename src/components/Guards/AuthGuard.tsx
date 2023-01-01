import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { authThunks } from '@redux/slices/auth.slice';
import { emailVerificationActions } from '@redux/slices/emailVerification.slice';
import { currentUserSelector, userThunks } from '@redux/slices/user.slice';
import { generalPaths, NonRequireAuthenticationRoutes } from '@src/paths';
import { useRouter } from 'next/router';
import type { PropsWithChildren } from 'react';
import React, { useEffect } from 'react';

type TAuthGuardProps = PropsWithChildren<{}>;

const AuthGuard: React.FC<TAuthGuardProps> = ({ children }) => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isAuthenticated, authInfoLoaded } = useAppSelector(
    (state) => state.auth,
  );
  const user = useAppSelector(currentUserSelector);
  const pathName = router.pathname;
  const isNonRequireAuthenticationRoute =
    NonRequireAuthenticationRoutes.includes(pathName);
  const isSignUpPath = pathName === generalPaths.SignUp;
  const showEmailVerification = !!user.id && !user.attributes.emailVerified;
  const shouldNavigateIfInSignUpFlow = isSignUpPath && !showEmailVerification;

  const homePageNavigateCondition =
    isAuthenticated &&
    isNonRequireAuthenticationRoute &&
    (!isSignUpPath || shouldNavigateIfInSignUpFlow);

  useEffect(() => {
    dispatch(authThunks.authInfo());
  }, [pathName]);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(userThunks.fetchCurrentUser(undefined));
      const isVerified = user?.attributes?.emailVerified;
      dispatch(emailVerificationActions.updateVerificationState(isVerified));
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (pathName !== generalPaths.StyleGuide) {
      if (authInfoLoaded) {
        if (isNonRequireAuthenticationRoute) {
          if (homePageNavigateCondition) {
            router.push(generalPaths.Home);
          }
        }
      }
    }
  }, [
    authInfoLoaded,
    isAuthenticated,
    router,
    homePageNavigateCondition,
    isNonRequireAuthenticationRoute,
  ]);

  return <>{children}</>;
};

export default AuthGuard;
