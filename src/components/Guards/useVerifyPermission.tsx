import { useAppSelector } from '@hooks/reduxHooks';
import {
  adminPaths,
  companyPaths,
  generalPaths,
  IgnoredPermissionCheckRoutes,
} from '@src/paths';
import { EUserPermission } from '@utils/enums';
import type { NextRouter } from 'next/router';
import { useRouter } from 'next/router';
import { useCallback, useEffect } from 'react';

import { isPathMatchedPermission } from './Guards.helper';

const verifyPermissionFn = ({
  isPassChecking,
  isMatchedPermission,
  userPermission,
  router,
}: {
  isPassChecking: boolean;
  isMatchedPermission: boolean | null;
  userPermission: EUserPermission;
  router: NextRouter;
}) => {
  if (isPassChecking) {
    return;
  }

  let homePageRoute;

  switch (userPermission) {
    case EUserPermission.admin:
      homePageRoute = adminPaths.Dashboard;
      break;
    case EUserPermission.company:
      homePageRoute = companyPaths.Home;
      break;
    default:
      homePageRoute = generalPaths.Home;
      break;
  }

  if (isMatchedPermission !== null && !isMatchedPermission) {
    router.push(homePageRoute);
  }
};

const useVerifyPermission = () => {
  const router = useRouter();
  const { pathname: pathName } = router;
  const { userPermission, currentUser } = useAppSelector((state) => state.user);
  const isMatchedPermission = currentUser
    ? isPathMatchedPermission(pathName, userPermission)
    : null;
  const isIgnoredPermissionCheck =
    IgnoredPermissionCheckRoutes.includes(pathName);

  const verifyPermissionCbFn = useCallback(() => {
    verifyPermissionFn({
      isPassChecking: isIgnoredPermissionCheck,
      router,
      isMatchedPermission,
      userPermission,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isIgnoredPermissionCheck, isMatchedPermission, pathName, userPermission]);

  useEffect(() => {
    verifyPermissionCbFn();
  }, [verifyPermissionCbFn]);

  return { isIgnoredPermissionCheck, userPermission, isMatchedPermission };
};

export default useVerifyPermission;
