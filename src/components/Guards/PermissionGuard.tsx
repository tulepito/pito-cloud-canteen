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
  const { userPermission } = useAppSelector((state) => state.user);
  const { children } = props;
  const isMatchedPermission = isPathMatchedPermission(
    router.route,
    userPermission,
  );

  const LayoutWrapper = getLayout(userPermission);
  const ComponentToRender = isMatchedPermission ? (
    <LayoutWrapper>{children}</LayoutWrapper>
  ) : null;

  useEffect(() => {
    let homePageRoute;

    switch (userPermission) {
      case EUserPermission.admin:
        homePageRoute = adminPaths.Home;
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
  }, [isMatchedPermission, router, userPermission]);

  return ComponentToRender;
};

export default PermissionGuard;
