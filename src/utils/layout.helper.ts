import AdminLayout from '@components/AdminLayout/AdminLayout';
import CompanyLayout from '@components/CompanyLayout/CompanyLayout';
import Layout from '@components/Layout/Layout';
import React from 'react';

import { EUserPermission } from './enums';

export const getLayout = (permission: EUserPermission) => {
  switch (permission) {
    case EUserPermission.admin:
      return AdminLayout;
    case EUserPermission.company:
      return CompanyLayout;
    case EUserPermission.normal:
      return Layout;
    default:
      return React.Fragment;
  }
};
