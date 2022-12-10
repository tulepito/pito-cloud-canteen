import IconHome from '@components/IconHome/IconHome';
import IconMenuArrow from '@components/IconMenuArrow/IconMenuArrow';
import IconUserManagement from '@components/IconUserManagement/IconUserManagement';
import PitoLogo from '@components/PitoLogo/PitoLogo';
import type { TIconProps } from '@utils/types';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import React, { useCallback, useState } from 'react';
import { useIntl } from 'react-intl';

import css from './AdminSidebar.module.scss';

type TSidebarEntity = {
  id: string | number;
  label: string;
  Icon?: React.FC<TIconProps>;
  childrenMenus?: TSidebarEntity[];
  nameLink?: string;
};

type TSubMenuProps = {
  menu: TSidebarEntity;
};

type TMenuProps = {
  menus: TSidebarEntity[];
};

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

const SubMenu: React.FC<TSubMenuProps> = (props) => {
  const { menu } = props;

  const intl = useIntl();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const { Icon, label, childrenMenus, nameLink } = menu;

  const hasChildrenMenus = childrenMenus && childrenMenus.length > 0;

  const handleMenuClick = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      e.stopPropagation();
      if (nameLink && !hasChildrenMenus) {
        return router.push(nameLink);
      }
      return setIsOpen(!isOpen);
    },
    [nameLink, hasChildrenMenus, setIsOpen, router, isOpen],
  );

  return (
    <div onClick={handleMenuClick} className={css.entityRoot}>
      <div className={css.entityWrapper}>
        <div className={css.entity}>
          {Icon && <Icon className={css.entityIcon} />}
          <p className={classNames(css.label, { [css.labelOpen]: isOpen })}>
            {intl.formatMessage({
              id: label,
            })}
          </p>
        </div>
        {hasChildrenMenus && (
          <IconMenuArrow
            className={classNames(css.menuArrowIcon, {
              [css.menuArrowOpen]: isOpen,
            })}
          />
        )}
      </div>
      {/* render children menu */}
      {isOpen && hasChildrenMenus && (
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        <Menu menus={childrenMenus} />
      )}
    </div>
  );
};

const Menu: React.FC<TMenuProps> = (props) => {
  const { menus } = props;
  return (
    <div className={css.subEntities}>
      {menus.map((menu: TSidebarEntity) => {
        return <SubMenu key={menu.id} menu={menu} />;
      })}
    </div>
  );
};

const AdminSidebar = () => {
  return (
    <div className={css.root}>
      <div className={css.top}>
        <PitoLogo />
      </div>
      <div className={css.center}>
        <div className={css.listEntities}>
          <Menu menus={SIDEBAR_MENUS} />
        </div>
      </div>
    </div>
  );
};

export default AdminSidebar;
