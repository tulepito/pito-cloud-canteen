import { useAppSelector } from '@hooks/reduxHooks';
import { currentUserSelector } from '@redux/slices/user.slice';
import paths, { AuthenticationRoutes } from '@src/paths';
import type { Router } from 'next/router';
import type { PropsWithChildren } from 'react';
import React, { useEffect } from 'react';

type TAuthGuardProps = PropsWithChildren<{
  router: Router;
  isRequiredAuth: boolean;
}>;

const AuthGuard: React.FC<TAuthGuardProps> = (props) => {
  const { children, isRequiredAuth, router } = props;
  const { isAuthenticated, authInfoLoaded } = useAppSelector(
    (state) => state.auth,
  );
  const user = useAppSelector(currentUserSelector);

  const pathName = router.route;
  const isAuthenticationRoute = AuthenticationRoutes.includes(pathName);
  const isSignUpPath = pathName.includes(paths.SignUp);
  const currentUserLoaded = !!user.id;
  const showEmailVerification =
    currentUserLoaded && !user.attributes.emailVerified;
  const shouldNavigateIfInSignUpFlow = isSignUpPath && !showEmailVerification;

  const homePageNavigateCondition =
    // eslint-disable-next-line no-unneeded-ternary
    isAuthenticated &&
    isAuthenticationRoute &&
    (!isSignUpPath || shouldNavigateIfInSignUpFlow);

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
