import { useAppSelector } from '@hooks/reduxHooks';
import { currentUserSelector } from '@redux/slices/user.slice';
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

  const currentUserLoaded = !!user.id;
  const showEmailVerification =
    currentUserLoaded && !user.attributes.emailVerified;
  const isSignUpPath = pathName.includes(paths.SignUp);
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
