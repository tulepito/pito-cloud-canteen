import HamburgerMenuButton from '@components/HamburgerMenuButton/HamburgerMenuButton';
import IconHome from '@components/IconHome/IconHome';
import IconOrderManagement from '@components/IconOrderManagement/IconOrderManagement';
import IconUserManagement from '@components/IconUserManagement/IconUserManagement';
import type { TSidebarMenu } from '@components/MultiLevelSidebar/MultiLevelSidebar';
import MultiLevelSidebar from '@components/MultiLevelSidebar/MultiLevelSidebar';
import OutsideClickHandler from '@components/OutsideClickHandler/OutsideClickHandler';
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
  {
    id: 'order',
    label: 'AdminSidebar.orderLabel',
    Icon: IconOrderManagement,
    level: 1,
    childrenMenus: [
      {
        id: 'createOrder',
        label: 'AdminSidebar.createOrder',
        nameLink: '/admin/order/create',
      },
    ],
  },
];

type TAdminSidebar = {
  onMenuClick: () => void;
  onCloseMenu: () => void;
};

const AdminSidebar: React.FC<TAdminSidebar> = (props) => {
  const { onMenuClick, onCloseMenu } = props;

  const onOutsideClick = () => {
    onCloseMenu();
  };

  return (
    <OutsideClickHandler onOutsideClick={onOutsideClick}>
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
    </OutsideClickHandler>
  );
};

export default AdminSidebar;
