import AdminHeader from '@components/AdminHeader/AdminHeader';
import IconHome from '@components/IconHome/IconHome';
import IconUserManagement from '@components/IconUserManagement/IconUserManagement';
import Meta from '@components/Layout/Meta';
import type { TSidebarEntity } from '@components/MultiLevelSidebar/MultiLevelSidebar';
import MultiLevelSidebar from '@components/MultiLevelSidebar/MultiLevelSidebar';
import React from 'react';
import { useIntl } from 'react-intl';

import css from './AdminDashboard.module.scss';

const SIDEBAR_MENUS: TSidebarEntity[] = [
  {
    id: 'home',
    label: 'AdminSidebar.homeLabel',
    nameLink: 'Home',
    Icon: IconHome,
  },
  {
    id: 'user',
    label: 'AdminSidebar.userLabel',
    Icon: IconUserManagement,
    childrenMenus: [
      {
        id: 'company',
        label: 'AdminSidebar.companyLabel',
        nameLink: 'Company',
      },
      {
        id: 'partner',
        label: 'AdminSidebar.partnerLabel',
        nameLink: 'Partner',
      },
      {
        id: 'custom',
        label: 'AdminSidebar.customLabel',
        childrenMenus: [
          {
            id: 'custom1',
            label: 'AdminSidebar.customLabel',
            childrenMenus: [
              {
                id: 'custom11',
                label: 'AdminSidebar.customLabel',
                nameLink: 'Custom11',
              },
              {
                id: 'custom22',
                label: 'AdminSidebar.customLabel',
                nameLink: 'Custom22',
              },
            ],
          },
          {
            id: 'custom2',
            label: 'AdminSidebar.customLabel',
            nameLink: 'Custom2',
          },
        ],
      },
    ],
  },
];

const AdminDashboard = () => {
  const intl = useIntl();
  const title = intl.formatMessage({
    id: 'AdminDashboard.title',
  });

  const description = intl.formatMessage({
    id: 'AdminDashboard.description',
  });

  return (
    <>
      <Meta title={title} description={description} />
      <div className={css.page}>
        <MultiLevelSidebar menus={SIDEBAR_MENUS} />
        <AdminHeader />
      </div>
    </>
  );
};

export default AdminDashboard;
