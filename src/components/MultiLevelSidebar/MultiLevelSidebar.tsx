import IconArrow from '@components/IconArrow/IconArrow';
import type { TIconProps } from '@utils/types';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';

import css from './MultiLevelSidebar.module.scss';

const getDynamicPathParamsName = (pathname: string) => {
  const newPathname = pathname.split('/');
  const paramNames: string[] = [];
  newPathname.forEach((path: string) => {
    const paramsName = path.substring(
      path.indexOf('[') + 1,
      path.lastIndexOf(']'),
    );
    if (paramsName) {
      paramNames.push(paramsName);
    }
  });
  return paramNames;
};

export type TSidebarMenu = {
  id: string | number;
  label: string;
  Icon?: React.FC<TIconProps>;
  childrenMenus?: TSidebarMenu[];
  nameLink?: string;
  isFirstLevel?: boolean;
  subNameLinks?: string[];
  showOnActiveChildrenMenus?: TSidebarMenu[];
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
  const { pathname, query } = router;

  const [isOpen, setIsOpen] = useState(false);

  const {
    Icon,
    label,
    childrenMenus,
    showOnActiveChildrenMenus,
    nameLink = '',
    isFirstLevel,
    subNameLinks,
  } = menu;

  const hasChildrenMenus =
    (showOnActiveChildrenMenus && showOnActiveChildrenMenus.length > 0) ||
    (childrenMenus && childrenMenus.length > 0);

  const childMenus = showOnActiveChildrenMenus || childrenMenus;

  const paramNames = getDynamicPathParamsName(nameLink);
  // Only get dynamic params not search params
  const newQueryParams = Object.keys(query).reduce((acc, key) => {
    if (paramNames.includes(key)) {
      return { ...acc, [key]: query[key] };
    }
    return acc;
  }, {});

  const childIsActive = useMemo(
    () => childMenus?.some((value) => value.nameLink === pathname),
    [pathname, childMenus],
  ) as boolean;

  const shouldShowMenuesOnActiveOnly =
    childIsActive && showOnActiveChildrenMenus;

  const handleMenuClick = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      e.stopPropagation();

      if ((nameLink && !hasChildrenMenus) || showOnActiveChildrenMenus) {
        return router.push({ pathname: nameLink, query: newQueryParams });
      }
      return setIsOpen(!isOpen);
    },
    [
      nameLink,
      hasChildrenMenus,
      showOnActiveChildrenMenus,
      isOpen,
      router,
      newQueryParams,
    ],
  );

  useEffect(() => {
    if (childIsActive) {
      setIsOpen(true);
    }
  }, [childIsActive]);

  const subMenuWrapperClasses = classNames(
    css.subMenu,
    subMenuWrapperClassName,
  );

  const activeWithSubNameLinks = subNameLinks?.includes(pathname);

  const isActive = activeWithSubNameLinks || pathname === nameLink;

  const subMenuLayoutClasses = classNames(
    css.subMenuLayout,
    subMenuLayoutClassName,
    {
      [css.isOpen]:
        isFirstLevel &&
        ((isOpen && childIsActive) || (!hasChildrenMenus && isActive)),
    },
  );

  return (
    <div onClick={handleMenuClick} className={subMenuWrapperClasses}>
      <div className={subMenuLayoutClasses}>
        <div className={css.subMenuItem}>
          {Icon && <Icon className={css.entityIcon} />}
          <div
            className={classNames(
              css.label,
              { [css.labelOpen]: isOpen },
              { [css.active]: isActive },
            )}>
            {intl.formatMessage({
              id: label,
            })}
          </div>
        </div>
        {hasChildrenMenus && shouldShowMenuesOnActiveOnly && (
          <IconArrow
            direction={isOpen ? 'up' : 'down'}
            className={css.menuArrowIcon}
          />
        )}
      </div>
      {/* render children menu */}
      {isOpen && childMenus && shouldShowMenuesOnActiveOnly && (
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        <Menu
          menus={childMenus}
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
