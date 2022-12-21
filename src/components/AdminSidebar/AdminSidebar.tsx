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
    nameLink: '/admin',
    Icon: IconHome,
    level: 1,
  },
  {
    id: 'user',
    label: 'AdminSidebar.userLabel',
    Icon: IconUserManagement,
    level: 1,
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
