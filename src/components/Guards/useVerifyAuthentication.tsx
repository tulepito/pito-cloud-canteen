import { useEffect } from 'react';
import { useRouter } from 'next/router';

import { useAppSelector } from '@hooks/reduxHooks';
import { generalPaths } from '@src/paths';

import { usePathChecker } from './Guards.helper';

const useVerifyAuthentication = (homePageNavigateCondition: boolean) => {
  const router = useRouter();
  const { isAuthenticated, authInfoLoaded } = useAppSelector(
    (state) => state.auth,
  );

  const {
    pathname,
    asPath: fullPath,
    query: { from: fromUrl },
  } = router;
  const { isIgnoredAuthCheckRoute, isNonRequireAuthenticationRoute } =
    usePathChecker(pathname);

  useEffect(() => {
    if (isIgnoredAuthCheckRoute || !authInfoLoaded) {
      return;
    }

    if (isNonRequireAuthenticationRoute) {
      if (homePageNavigateCondition) {
        router.push(fromUrl ? (fromUrl as string) : generalPaths.Home);
      }
    } else if (!isAuthenticated) {
      router.push({
        pathname: generalPaths.SignIn,
        query: { from: fullPath },
      });
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
  ]);
};

export default useVerifyAuthentication;
