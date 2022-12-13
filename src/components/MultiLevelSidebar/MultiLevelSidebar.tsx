import IconMenuArrow from '@components/IconMenuArrow/IconMenuArrow';
import type { TIconProps } from '@utils/types';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import React, { useCallback, useState } from 'react';
import { useIntl } from 'react-intl';

import css from './MultiLevelSidebar.module.scss';

export type TSidebarMenu = {
  id: string | number;
  label: string;
  Icon?: React.FC<TIconProps>;
  childrenMenus?: TSidebarMenu[];
  nameLink?: string;
};

type TMenuWithClasses = {
  menuWrapperClassName?: string;
  subMenuWrapperClassName?: string;
  subMenuLayoutClassName?: string;
};

type TSubMenuProps = {
  menu: TSidebarMenu;
} & TMenuWithClasses;

type TMenuProps = {
  menus: TSidebarMenu[];
} & TMenuWithClasses;

type TMultiLevelSidebar = {
  menus: TSidebarMenu[];
  rootClassName?: string;
} & TMenuWithClasses;

const SubMenu: React.FC<TSubMenuProps> = (props) => {
  const {
    menu,
    subMenuWrapperClassName,
    subMenuLayoutClassName,
    menuWrapperClassName,
  } = props;

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

  const subMenuWrapperClasses = classNames(
    css.subMenu,
    subMenuWrapperClassName,
  );

  const subMenuLayoutClasses = classNames(
    css.subMenuLayout,
    subMenuLayoutClassName,
  );

  return (
    <div onClick={handleMenuClick} className={subMenuWrapperClasses}>
      <div className={subMenuLayoutClasses}>
        <div className={css.subMenuItem}>
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
        <Menu
          menus={childrenMenus}
          subMenuWrapperClassName={subMenuWrapperClassName}
          subMenuLayoutClassName={subMenuLayoutClassName}
          menuWrapperClassName={menuWrapperClassName}
        />
      )}
    </div>
  );
};

const Menu: React.FC<TMenuProps> = (props) => {
  const {
    menus,
    menuWrapperClassName,
    subMenuWrapperClassName,
    subMenuLayoutClassName,
  } = props;

  const menuWrapperClasses = classNames(css.menuWrapper, menuWrapperClassName);

  return (
    <div className={menuWrapperClasses}>
      {menus.map((menu: TSidebarMenu) => {
        return (
          <SubMenu
            key={menu.id}
            menu={menu}
            menuWrapperClassName={menuWrapperClassName}
            subMenuWrapperClassName={subMenuWrapperClassName}
            subMenuLayoutClassName={subMenuLayoutClassName}
          />
        );
      })}
    </div>
  );
};

const MultiLevelSidebar = (props: TMultiLevelSidebar) => {
  const {
    menus,
    rootClassName,
    menuWrapperClassName,
    subMenuWrapperClassName,
    subMenuLayoutClassName,
  } = props;
  const rootClasses = classNames(css.root, rootClassName);
  return (
    <div className={rootClasses}>
      <Menu
        menus={menus}
        menuWrapperClassName={menuWrapperClassName}
        subMenuWrapperClassName={subMenuWrapperClassName}
        subMenuLayoutClassName={subMenuLayoutClassName}
      />
    </div>
  );
};

export default MultiLevelSidebar;
