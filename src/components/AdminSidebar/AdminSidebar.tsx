import HamburgerMenuButton from '@components/HamburgerMenuButton/HamburgerMenuButton';
import IconHome from '@components/IconHome/IconHome';
import IconUserManagement from '@components/IconUserManagement/IconUserManagement';
import type { TSidebarMenu } from '@components/MultiLevelSidebar/MultiLevelSidebar';
import MultiLevelSidebar from '@components/MultiLevelSidebar/MultiLevelSidebar';
import PitoLogo from '@components/PitoLogo/PitoLogo';
import React from 'react';

import css from './AdminSidebar.module.scss';

const SIDEBAR_MENUS: TSidebarMenu[] = [
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
        nameLink: '/admin/company',
      },
      {
        id: 'partner',
        label: 'AdminSidebar.partnerLabel',
        nameLink: '/admin/partner',
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

type TAdminSidebar = {
  onMenuClick: () => void;
};

const AdminSidebar: React.FC<TAdminSidebar> = (props) => {
  const { onMenuClick } = props;
  return (
    <div className={css.root}>
      <div className={css.logo}>
        <PitoLogo />
        <HamburgerMenuButton
          onClick={onMenuClick}
          className={css.hamburgerMenu}
        />
      </div>
      <MultiLevelSidebar menus={SIDEBAR_MENUS} />
    </div>
  );
};

export default AdminSidebar;
