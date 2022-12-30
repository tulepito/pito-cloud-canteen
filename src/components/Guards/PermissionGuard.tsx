import { useAppSelector } from '@hooks/reduxHooks';
import { adminPaths, companyPaths, generalPaths } from '@src/paths';
import { EUserPermission } from '@utils/enums';
import { getLayout } from '@utils/layout.helper';
import { isPathMatchedPermission } from '@utils/urlHelpers';
import { useRouter } from 'next/router';
import type { PropsWithChildren } from 'react';
import React, { useEffect } from 'react';

type TPermissionGuardGuard = PropsWithChildren<{}>;

const PermissionGuard: React.FC<TPermissionGuardGuard> = (props) => {
  const router = useRouter();
  const { userPermission, currentUser } = useAppSelector((state) => state.user);
  const { children } = props;
  const isMatchedPermission =
    currentUser !== null
      ? isPathMatchedPermission(router.route, userPermission)
      : true;

  const LayoutWrapper = getLayout(userPermission);
  const ComponentToRender = isMatchedPermission ? (
    <LayoutWrapper>{children}</LayoutWrapper>
  ) : null;

  useEffect(() => {
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

    if (!isMatchedPermission) {
      router.push(homePageRoute);
    }
  }, [isMatchedPermission]);

  return ComponentToRender;
};

export default PermissionGuard;
