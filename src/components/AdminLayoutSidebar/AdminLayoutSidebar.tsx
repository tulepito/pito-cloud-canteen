/**
 * This is a wrapper component for different Layouts.
 * Topbar should be added to this wrapper.
 */
import classNames from 'classnames';
import React from 'react';

import css from './AdminLayoutSidebar.module.scss';

const AdminLayoutSidebar = (props: any) => {
  const { className, rootClassName, children, isMenuOpen } = props;
  const classes = classNames(rootClassName || css.root, className, {
    [css.menuOpen]: isMenuOpen,
  });

  return <div className={classes}>{children}</div>;
};

export default AdminLayoutSidebar;
