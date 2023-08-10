import React, { useMemo } from 'react';
import { useIntl } from 'react-intl';
import classNames from 'classnames';
import { useRouter } from 'next/router';

import IconHome from '@components/Icons/IconHome/IconHome';
import IconOrderManagement from '@components/Icons/IconOrderManagement/IconOrderManagement';
import IconWallet from '@components/Icons/IconWallet/IconWallet';
import type { TSidebarMenu } from '@components/MultiLevelSidebar/MultiLevelSidebar';
import MultiLevelSidebar from '@components/MultiLevelSidebar/MultiLevelSidebar';
import NamedLink from '@components/NamedLink/NamedLink';
import OutsideClickHandler from '@components/OutsideClickHandler/OutsideClickHandler';
import { partnerPaths } from '@src/paths';

import css from './PartnerSidebar.module.scss';

const LIST_SIDEBAR_MENU: TSidebarMenu[] = [
  {
    id: 'dashboard',
    Icon: IconHome,
    nameLink: partnerPaths.Home,
    label: 'PartnerSidebar.dashboardLabel',
    isFirstLevel: true,
  },
  {
    id: 'orders',
    Icon: IconOrderManagement,
    nameLink: partnerPaths.ManageOrders,
    label: 'PartnerSidebar.orderPageLabel',
    isFirstLevel: true,
    childrenMenus: [
      {
        id: 'manageOrders',
        label: 'PartnerSidebar.manageOrdersLabel',
        nameLink: partnerPaths.ManageOrders,
        highlightRefLinks: [partnerPaths.SubOrderDetail],
      },
    ],
  },
  {
    id: 'payment',
    Icon: IconWallet,
    nameLink: partnerPaths.ManagePayments,
    label: 'PartnerSidebar.paymentLabel',
    isFirstLevel: true,
  },
];

type TAdminSidebarProps = {
  onMenuClick: () => void;
  onCloseMenu: () => void;
};

const checkNestedPathActive = (arr: TSidebarMenu[], pathName: string) => {
  // eslint-disable-next-line no-restricted-syntax
  for (const item of arr) {
    if (item.showOnActiveChildrenMenus) {
      const child = checkNestedPathActive(
        item.showOnActiveChildrenMenus,
        pathName,
      );
      if (child) return item;
    }
    if (item.highlightRefLinks?.includes(pathName)) return item;
    if (item.nameLink === pathName) return item;
    if (item.childrenMenus) {
      const child = checkNestedPathActive(item.childrenMenus, pathName);
      if (child) return item;
    }
  }
};

const AdminSidebar: React.FC<TAdminSidebarProps> = (props) => {
  const { onCloseMenu } = props;
  const intl = useIntl();

  const router = useRouter();

  const { pathname } = router;

  const activeMenu = useMemo(
    () => checkNestedPathActive(LIST_SIDEBAR_MENU, pathname),
    [pathname],
  );

  return (
    <OutsideClickHandler onOutsideClick={onCloseMenu}>
      <div className={css.root}>
        <div className={css.leftSide}>
          {LIST_SIDEBAR_MENU.map((item: TSidebarMenu) => {
            const { Icon, id, nameLink } = item;

            const isActive = activeMenu?.id === item.id;

            return (
              <NamedLink
                path={nameLink}
                key={id}
                className={classNames(css.sidebarButton, {
                  [css.active]: isActive,
                })}>
                {Icon && <Icon className={css.sidebarIcon} />}
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
              menuLabelClassName={css.menuItemLabel}
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
