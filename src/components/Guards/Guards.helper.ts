import React from 'react';

import AdminLayout from '@components/Layout/AdminLayout/AdminLayout';
import CompanyLayout from '@components/Layout/CompanyLayout/CompanyLayout';
import GeneralLayout from '@components/Layout/GeneralLayout/Layout';
import {
  adminPaths,
  companyPaths,
  generalPaths,
  IgnoredAuthCheckRoutes,
  NonRequireAuthenticationRoutes,
} from '@src/paths';
import { EUserPermission, startRouteBaseOnPermission } from '@utils/enums';

export const usePathChecker = (pathname: string) => {
  return {
    isNonRequireAuthenticationRoute:
      NonRequireAuthenticationRoutes.includes(pathname),
    isIgnoredAuthCheckRoute: IgnoredAuthCheckRoutes.includes(pathname),
  };
};

export const getLayoutBaseOnPermission = (permission: EUserPermission) => {
  switch (permission) {
    case EUserPermission.admin:
      return AdminLayout;
    case EUserPermission.company:
      return CompanyLayout;
    case EUserPermission.normal:
      return GeneralLayout;
    default:
      return React.Fragment;
  }
};

export const isPathMatchedPermission = (
  pathName: string,
  permission: EUserPermission,
) => {
  if (permission !== EUserPermission.normal) {
    const startPath = startRouteBaseOnPermission[permission];

    return pathName.startsWith(startPath);
  }

  return Object.values(startRouteBaseOnPermission).every((item) => {
    return !pathName.startsWith(item);
  });
};

export const getHomePageRouteBaseOnPermission = (
  permission: EUserPermission,
) => {
  let homePageRoute;

  switch (permission) {
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

  return homePageRoute;
};
