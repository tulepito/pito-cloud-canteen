import IconHome from '@components/IconHome/IconHome';
import IconOrderManagement from '@components/IconOrderManagement/IconOrderManagement';
import IconUserManagement from '@components/IconUserManagement/IconUserManagement';
import type { TSidebarMenu } from '@components/MultiLevelSidebar/MultiLevelSidebar';
import MultiLevelSidebar from '@components/MultiLevelSidebar/MultiLevelSidebar';
import NamedLink from '@components/NamedLink/NamedLink';
import OutsideClickHandler from '@components/OutsideClickHandler/OutsideClickHandler';
import { adminRoutes } from '@src/paths';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import React, { useMemo } from 'react';
import { useIntl } from 'react-intl';

import css from './AdminSidebar.module.scss';

const LIST_SIDEBAR_MENU: TSidebarMenu[] = [
  {
    id: 'dashboard',
    Icon: IconHome,
    nameLink: adminRoutes.Dashboard.path,
    label: 'AdminSidebar.dashboardLabel',
    isFirstLevel: true,
  },
  {
    id: 'order',
    Icon: IconOrderManagement,
    nameLink: adminRoutes.CreateOrder.path,
    label: 'AdminSidebar.orderLabel',
    isFirstLevel: true,
    childrenMenus: [
      {
        id: 'createOrder',
        label: 'AdminSidebar.createOrderLabel',
        nameLink: adminRoutes.CreateOrder.path,
      },
      {
        id: 'manageOrders',
        label: 'AdminSidebar.manageOrderLabel',
        nameLink: adminRoutes.ManageOrders.path,
      },
    ],
  },
  {
    id: 'user',
    label: 'AdminSidebar.userLabel',
    Icon: IconUserManagement,
    isFirstLevel: true,
    nameLink: adminRoutes.ManageCompanies.path,
    childrenMenus: [
      {
        id: 'company',
        label: 'AdminSidebar.companyLabel',
        nameLink: adminRoutes.ManageCompanies.path,
        // Sub name links => if pathname in these path, it will active the parent namelink
        // Example : current pathname is '/admin/company/create' => the menu with nameLink '/admin/company' will be hightlighted
        subNameLinks: [
          adminRoutes.CreateCompany.path,
          adminRoutes.EditCompany.path,
          adminRoutes.CompanyDetails.path,
        ],
      },
      {
        id: 'partner',
        label: 'AdminSidebar.partnerLabel',
        nameLink: adminRoutes.ManagePartners.path,
        subNameLinks: [
          adminRoutes.ManagePartners.path,
          adminRoutes.CreatePartner.path,
          adminRoutes.EditPartner.path,
          adminRoutes.PartnerDetails.path,
        ],
      },
    ],
  },
];

type TAdminSidebar = {
  onMenuClick: () => void;
  onCloseMenu: () => void;
};

const checkNestedPathActive = (arr: any[], pathName: string) => {
  // eslint-disable-next-line no-restricted-syntax
  for (const item of arr) {
    if (item.subNameLinks?.includes(pathName)) return item;
    if (item.nameLink === pathName) return item;
    if (item.childrenMenus) {
      const child = checkNestedPathActive(item.childrenMenus, pathName);
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
    () => checkNestedPathActive(LIST_SIDEBAR_MENU, pathname),
    [pathname],
  );

  return (
    <OutsideClickHandler onOutsideClick={onOutsideClick}>
      <div className={css.root}>
        <div className={css.leftSide}>
          {LIST_SIDEBAR_MENU.map((item: any) => {
            const {
              Icon,
              id,
              nameLink,
              subNameLinks,
              childrenMenus = [],
            } = item;
            const activeWithChildrenNameLinks = childrenMenus.find(
              (m: TSidebarMenu) => m.nameLink === pathname,
            );

            const activeWithChildrenSubNameLinks = childrenMenus.find(
              (m: TSidebarMenu) => m.subNameLinks?.includes(pathname),
            );

            const activeWithSubNameLinks = subNameLinks?.includes(pathname);
            const isActive =
              activeWithChildrenSubNameLinks ||
              activeWithChildrenNameLinks ||
              activeWithSubNameLinks ||
              pathname === nameLink;
            return (
              <NamedLink
                path={nameLink}
                key={id}
                className={classNames(css.sidebarButton, {
                  [css.active]: isActive,
                })}>
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
