import AdminLayout from '@components/Layout/AdminLayout/AdminLayout';
import CompanyLayout from '@components/Layout/CompanyLayout/CompanyLayout';
import GeneralLayout from '@components/Layout/GeneralLayout/Layout';
import React from 'react';

import { EUserPermission } from './enums';

export const getLayout = (permission: EUserPermission) => {
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
