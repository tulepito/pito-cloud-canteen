import React from 'react';

import AdminLayout from '@components/Layout/AdminLayout/AdminLayout';
import CompanyLayout from '@components/Layout/CompanyLayout/CompanyLayout';
import GeneralLayout from '@components/Layout/GeneralLayout/Layout';
import PartnerLayout from '@components/Layout/PartnerLayout/PartnerLayout';
import {
  adminPaths,
  companyPaths,
  IgnoredAuthCheckRoutes,
  NonRequireAuthenticationRoutes,
  participantPaths,
  partnerPaths,
} from '@src/paths';
import { EUserSystemPermission } from '@utils/enums';

export const START_ROUTE_BASE_ON_PERMISSION = {
  [EUserSystemPermission.company]: '/company',
  [EUserSystemPermission.admin]: '/admin',
  [EUserSystemPermission.normal]: '/participant',
  [EUserSystemPermission.partner]: '/partner',
};

export const usePathChecker = (pathname: string) => {
  return {
    isNonRequireAuthenticationRoute:
      NonRequireAuthenticationRoutes.includes(pathname),
    isIgnoredAuthCheckRoute: IgnoredAuthCheckRoutes.includes(pathname),
  };
};

export const getLayoutBaseOnPermission = (
  permission: EUserSystemPermission,
) => {
  switch (permission) {
    case EUserSystemPermission.admin:
      return AdminLayout;
    case EUserSystemPermission.partner:
      return PartnerLayout;
    case EUserSystemPermission.company:
      return CompanyLayout;
    case EUserSystemPermission.normal:
      return GeneralLayout;
    default:
      return React.Fragment;
  }
};

export const isPathMatchedPermission = (
  pathName: string,
  permission: EUserSystemPermission,
) => {
  const startPath = START_ROUTE_BASE_ON_PERMISSION[permission];

  return pathName.startsWith(startPath);
};

export const getHomePageRouteBaseOnPermission = (
  permission: EUserSystemPermission,
) => {
  let homePageRoute;

  switch (permission) {
    case EUserSystemPermission.admin:
      homePageRoute = adminPaths.Dashboard;
      break;
    case EUserSystemPermission.partner:
      homePageRoute = partnerPaths.Home;
      break;
    case EUserSystemPermission.company:
      homePageRoute = companyPaths.Home;
      break;
    default:
      homePageRoute = participantPaths.OrderList;
      break;
  }

  return homePageRoute;
};
