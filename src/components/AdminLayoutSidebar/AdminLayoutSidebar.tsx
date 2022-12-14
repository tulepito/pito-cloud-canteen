/**
 * This is a wrapper component for different Layouts.
 * Topbar should be added to this wrapper.
 */
import classNames from 'classnames';
import React from 'react';

import css from './AdminLayoutSidebar.module.scss';

const AdminLayoutSidebar = (props: any) => {
  const { className, rootClassName, children } = props;
  const classes = classNames(rootClassName || css.root, className);

  return <div className={classes}>{children}</div>;
};

export default AdminLayoutSidebar;
