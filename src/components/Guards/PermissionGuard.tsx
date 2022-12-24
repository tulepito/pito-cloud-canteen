import { useAppSelector } from '@hooks/reduxHooks';
import Home from '@src/pages/index.route';
import { getLayout } from '@utils/layout.helper';
import { isPathMatchedPermission } from '@utils/urlHelpers';
import type { Router } from 'next/router';
import type { PropsWithChildren } from 'react';
import React from 'react';

type TPermissionGuardGuard = PropsWithChildren<{
  router: Router;
}>;

const PermissionGuard: React.FC<TPermissionGuardGuard> = (props) => {
  const { children, router } = props;
  const { userPermission } = useAppSelector((state) => state.user);
  const isMatchedPermission = isPathMatchedPermission(
    router.route,
    userPermission,
  );

  const LayoutWrapper = getLayout(userPermission);
  const ComponentToRender = isMatchedPermission ? (
    <LayoutWrapper>{children}</LayoutWrapper>
  ) : (
    <Home />
  );

  return ComponentToRender;
};

export default PermissionGuard;
