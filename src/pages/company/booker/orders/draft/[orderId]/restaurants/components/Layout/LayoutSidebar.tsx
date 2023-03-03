import type { PropsWithChildren } from 'react';
import React, { useCallback, useState } from 'react';
import classNames from 'classnames';

import IconMenu from '@components/Icons/IconMenu/IconMenu';

import css from './Layout.module.scss';

const LayoutSidebar: React.FC<PropsWithChildren> = ({ children }) => {
  const [filterMobileMenuOpen, setFilterMobileMenuOpen] = useState(false);

  const handleFilterMobileMenuClick = useCallback(() => {
    setFilterMobileMenuOpen(!filterMobileMenuOpen);
  }, [filterMobileMenuOpen]);

  return (
    <>
      <IconMenu
        className={classNames(css.filterMobileMenu, {
          [css.filterMobileMenuOpened]: filterMobileMenuOpen,
        })}
        onClick={handleFilterMobileMenuClick}
      />
      <div
        className={classNames(css.sidebar, {
          [css.sidebarOpened]: filterMobileMenuOpen,
        })}>
        {children}
      </div>
    </>
  );
};

export default LayoutSidebar;
