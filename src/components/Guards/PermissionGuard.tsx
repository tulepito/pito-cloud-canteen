import LoadingContainer from '@components/LoadingContainer/LoadingContainer';
import { useAppSelector } from '@hooks/reduxHooks';
import {
  adminPaths,
  companyPaths,
  generalPaths,
  IgnoredPermissionCheckRoutes,
} from '@src/paths';
import { EUserPermission } from '@utils/enums';
import { getLayout } from '@utils/layout.helper';
import { isPathMatchedPermission } from '@utils/urlHelpers';
import { useRouter } from 'next/router';
import type { PropsWithChildren } from 'react';
import React, { useCallback, useEffect } from 'react';

type TPermissionGuardGuard = PropsWithChildren<{}>;

const PermissionGuard: React.FC<TPermissionGuardGuard> = (props) => {
  const router = useRouter();
  const { pathname: pathName } = router;
  const { userPermission, currentUser } = useAppSelector((state) => state.user);
  const { children } = props;
  const isMatchedPermission = currentUser
    ? isPathMatchedPermission(pathName, userPermission)
    : null;
  const isIgnoredPermissionCheckRoute =
    IgnoredPermissionCheckRoutes.includes(pathName);

  const verifyPermission = useCallback(() => {
    if (isIgnoredPermissionCheckRoute) {
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

    if (isMatchedPermission === null) {
      router.push(generalPaths.SignIn);
    } else if (!isMatchedPermission) {
      router.push(homePageRoute);
    }
  }, [
    isIgnoredPermissionCheckRoute,
    isMatchedPermission,
    pathName,
    userPermission,
  ]);

  const renderComponent = () => {
    if (isIgnoredPermissionCheckRoute) {
      return children;
    }

    const LayoutWrapper = getLayout(userPermission);

    return !!isMatchedPermission && isMatchedPermission ? (
      <LayoutWrapper>{children}</LayoutWrapper>
    ) : (
      <LoadingContainer />
    );
  };

  useEffect(() => {
    verifyPermission();
  }, [verifyPermission]);

  return <>{renderComponent()}</>;
};

export default PermissionGuard;
