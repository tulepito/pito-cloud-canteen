import IconHome from '@components/IconHome/IconHome';
import IconOrderManagement from '@components/IconOrderManagement/IconOrderManagement';
import MultiLevelSidebar from '@components/MultiLevelSidebar/MultiLevelSidebar';
import NamedLink from '@components/NamedLink/NamedLink';
import OutsideClickHandler from '@components/OutsideClickHandler/OutsideClickHandler';
import { adminPaths } from '@src/paths';
import { useRouter } from 'next/router';
import React, { useMemo } from 'react';
import { useIntl } from 'react-intl';

import css from './AdminSidebar.module.scss';

const LIST_SIDEBAR_MENU = [
  {
    id: 'dashboard',
    Icon: IconHome,
    nameLink: adminPaths.Dashboard,
    label: 'Trang chủ',
  },
  {
    id: 'order',
    Icon: IconOrderManagement,
    nameLink: adminPaths.CreateOrder,
    label: 'AdminSidebar.orderLabel',
    childrenMenus: [
      {
        id: 'createOrder',
        label: 'AdminSidebar.createOrderLabel',
        nameLink: '/admin/order/create',
      },
      {
        id: 'partner',
        label: 'AdminSidebar.partnerLabel',
        nameLink: '/admin/partner',
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

const getNestedPath = (arr: any[], pathName: string) => {
  // eslint-disable-next-line no-restricted-syntax
  for (const item of arr) {
    if (item.nameLink === pathName) return item;
    if (item.childrenMenus) {
      const child = getNestedPath(item.childrenMenus, pathName);
      if (child) return item;
    }
  }
};

const AdminSidebar: React.FC<TAdminSidebar> = (props) => {
  const { onCloseMenu } = props;
  const intl = useIntl();

  const onOutsideClick = () => {
    onCloseMenu();
  };

  const router = useRouter();

  const { pathname } = router;

  const activeMenu = useMemo(
    () => getNestedPath(LIST_SIDEBAR_MENU, pathname),
    [LIST_SIDEBAR_MENU, pathname],
  );

  return (
    <OutsideClickHandler onOutsideClick={onOutsideClick}>
      <div className={css.root}>
        <div className={css.leftSide}>
          {LIST_SIDEBAR_MENU.map((item: any) => {
            const { Icon, id, nameLink } = item;
            return (
              <NamedLink path={nameLink} key={id} className={css.sidebarButton}>
                <Icon className={css.sidebarIcon} />
              </NamedLink>
            );
          })}
        </div>
        {activeMenu && (
          <div className={css.rightSide}>
            <h1 className={css.menuLabel}>
              {intl.formatMessage({ id: activeMenu.label })}
            </h1>
            <MultiLevelSidebar
              rootClassName={css.multiLevelMenu}
              subMenuLayoutClassName={css.subMenuLayout}
              menus={activeMenu.childrenMenus || []}
            />
          </div>
        )}
      </div>
    </OutsideClickHandler>
  );
};

export default AdminSidebar;
