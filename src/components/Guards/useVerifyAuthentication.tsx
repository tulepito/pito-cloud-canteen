import { useEffect } from 'react';
import { useRouter } from 'next/router';

import { useAppSelector } from '@hooks/reduxHooks';
import { enGeneralPaths, generalPaths, participantPaths } from '@src/paths';

import { usePathChecker } from './Guards.helper';

const PATHS_REDIRECT_TO_SIGN_UP_IF_UNAUTHENTICATED = [
  participantPaths.Invitation,
];

const useVerifyAuthentication = (homePageNavigateCondition: boolean) => {
  const router = useRouter();
  const { isAuthenticated, authInfoLoaded } = useAppSelector(
    (state) => state.auth,
  );

  const {
    pathname,
    asPath: fullPath,
    query: { from: fromUrl },
    isReady: isRouterReady,
  } = router;

  const { isIgnoredAuthCheckRoute, isNonRequireAuthenticationRoute } =
    usePathChecker(pathname);

  useEffect(() => {
    if (isIgnoredAuthCheckRoute || !authInfoLoaded) {
      return;
    }

    if (isNonRequireAuthenticationRoute) {
      if (homePageNavigateCondition && isRouterReady) {
        router.push(fromUrl ? (fromUrl as string) : enGeneralPaths.Auth);
      }
    } else if (!isAuthenticated) {
      if (PATHS_REDIRECT_TO_SIGN_UP_IF_UNAUTHENTICATED.includes(pathname)) {
        router.replace({
          pathname: generalPaths.SignUp,
          query: { from: fullPath },
        });
      } else {
        router.push({
          pathname: generalPaths.SignIn,
          query: { from: fullPath },
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    authInfoLoaded,
    homePageNavigateCondition,
    isAuthenticated,
    isIgnoredAuthCheckRoute,
    isNonRequireAuthenticationRoute,
    pathname,
    fullPath,
    isRouterReady,
  ]);
};

export default useVerifyAuthentication;
