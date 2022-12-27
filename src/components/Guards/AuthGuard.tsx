import { useAppSelector } from '@hooks/reduxHooks';
import { currentUserSelector } from '@redux/slices/user.slice';
import paths, { AuthenticationRoutes } from '@src/paths';
import { useRouter } from 'next/router';
import type { PropsWithChildren } from 'react';
import React, { useEffect } from 'react';

type TAuthGuardProps = PropsWithChildren<{
  isRequiredAuth: boolean;
}>;

const AuthGuard: React.FC<TAuthGuardProps> = (props) => {
  const router = useRouter();
  const { children, isRequiredAuth } = props;
  const { isAuthenticated, authInfoLoaded } = useAppSelector(
    (state) => state.auth,
  );
  const user = useAppSelector(currentUserSelector);
  const pathName = router.pathname;

  const isAuthenticationRoute = AuthenticationRoutes.includes(pathName);
  const isSignUpPath = pathName.includes(paths.SignUp);
  const showEmailVerification = !!user.id && !user.attributes.emailVerified;
  const shouldNavigateIfInSignUpFlow = isSignUpPath && !showEmailVerification;

  const homePageNavigateCondition =
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
