/**
 * This is a wrapper component for different Layouts.
 * Topbar should be added to this wrapper.
 */
import classNames from 'classnames';
import type { ReactNode } from 'react';
import React from 'react';

import css from './AdminLayoutSidebar.module.scss';

type TAdminLayoutSidebar = {
  className?: string;
  rootClassName?: string;
  children?: ReactNode;
  isMenuOpen?: boolean;
};

const AdminLayoutSidebar = (props: TAdminLayoutSidebar) => {
  const { className, rootClassName, children, isMenuOpen } = props;
  const classes = classNames(rootClassName || css.root, className, {
    [css.menuOpen]: isMenuOpen,
  });

  return <div className={classes}>{children}</div>;
};

export default AdminLayoutSidebar;
