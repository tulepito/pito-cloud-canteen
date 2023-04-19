import React, { useMemo } from 'react';
import { useIntl } from 'react-intl';
import classNames from 'classnames';
import { useRouter } from 'next/router';

import IconHome from '@components/Icons/IconHome/IconHome';
import IconOrderManagement from '@components/Icons/IconOrderManagement/IconOrderManagement';
import IconSetting from '@components/Icons/IconSetting/IconSetting';
import IconUserManagement from '@components/Icons/IconUserManagement/IconUserManagement';
import type { TSidebarMenu } from '@components/MultiLevelSidebar/MultiLevelSidebar';
import MultiLevelSidebar from '@components/MultiLevelSidebar/MultiLevelSidebar';
import NamedLink from '@components/NamedLink/NamedLink';
import OutsideClickHandler from '@components/OutsideClickHandler/OutsideClickHandler';
import { adminRoutes } from '@src/paths';

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
    nameLink: adminRoutes.ManageOrders.path,
    label: 'AdminSidebar.orderLabel',
    isFirstLevel: true,
    childrenMenus: [
      {
        id: 'createOrder',
        label: 'AdminSidebar.createOrderLabel',
        nameLink: adminRoutes.CreateOrder.path,
        highlightRefLinks: [adminRoutes.UpdateDraftOrder.path],
      },
      {
        id: 'manageOrders',
        label: 'AdminSidebar.manageOrderLabel',
        nameLink: adminRoutes.ManageOrders.path,
        // highlightRefLinks => if pathname in these paths, it will activate the parent namelink
        // Example : current pathname is '/admin/company/create' => the menu with nameLink '/admin/company' will be hightlighted
        highlightRefLinks: [adminRoutes.OrderDetails.path],
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
        highlightRefLinks: [
          adminRoutes.CreateCompany.path,
          adminRoutes.EditCompany.path,
          adminRoutes.CompanyDetails.path,
        ],
      },
      {
        id: 'partner',
        label: 'AdminSidebar.partnerLabel',
        nameLink: adminRoutes.ManagePartners.path,
        highlightRefLinks: [adminRoutes.CreatePartner.path],
        // showOnActiveChildrenMenus has all childrens that only show up when these menues is active
        // Example : Default is not showing these paths. But when the pathname === nameLink in these paths
        showOnActiveChildrenMenus: [
          {
            id: 'editOrder',
            label: 'AdminSidebar.partnerDetailsLabel',
            nameLink: adminRoutes.PartnerDetails.path,
            highlightRefLinks: [adminRoutes.EditPartner.path],
          },
          {
            id: 'partnerSettings',
            label: 'AdminSidebar.partnerSettingLabel',
            nameLink: adminRoutes.PartnerSettings.path,
            childrenMenus: [
              {
                id: 'managePartnerMenu',
                label: 'AdminSidebar.managePartnerMenuLabel',
                highlightRefLinks: [
                  adminRoutes.CreatePartnerMenu.path,
                  adminRoutes.EditPartnerMenu.path,
                ],
                childrenMenus: [
                  {
                    id: 'managePartnerFixedMenu',
                    label: 'AdminSidebar.managePartnerFixedMenuLabel',
                    nameLink: adminRoutes.ManagePartnerFixedMenus.path,
                  },
                  {
                    id: 'managePartnerCycleMenu',
                    label: 'AdminSidebar.managePartnerCycleMenuLabel',
                    nameLink: adminRoutes.ManagePartnerCycleMenus.path,
                  },
                ],
              },
              {
                id: 'managePartnerFood',
                label: 'AdminSidebar.managePartnerFoodLabel',
                nameLink: adminRoutes.ManagePartnerFoods.path,
                highlightRefLinks: [
                  adminRoutes.CreatePartnerFood.path,
                  adminRoutes.EditPartnerFood.path,
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'setting',
    Icon: IconSetting,
    nameLink: adminRoutes.AttributesSetting.path,
    label: 'AdminSidebar.settingLabel',
    isFirstLevel: true,
    childrenMenus: [
      {
        id: 'attributesSetting',
        label: 'AdminSidebar.attributesSettingLabel',
        nameLink: adminRoutes.AttributesSetting.path,
        highlightRefLinks: [adminRoutes.AttributesSetting.path],
      },
    ],
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
