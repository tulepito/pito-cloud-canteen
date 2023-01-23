import AdminLayout from '@components/Layout/AdminLayout/AdminLayout';
import CompanyLayout from '@components/Layout/CompanyLayout/CompanyLayout';
import GeneralLayout from '@components/Layout/GeneralLayout/Layout';
import { EUserPermission, startRouteBaseOnPermission } from '@utils/enums';
import React from 'react';

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
  let isMatched;

  if (permission !== EUserPermission.normal) {
    const startPath = startRouteBaseOnPermission[permission];
    isMatched = pathName.startsWith(startPath);
  } else {
    isMatched = Object.values(startRouteBaseOnPermission).every((item) => {
      return !pathName.startsWith(item);
    });
  }

  return isMatched;
};
