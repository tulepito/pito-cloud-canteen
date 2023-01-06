/**
 * This is a wrapper component for different Layouts.
 * Topbar should be added to this wrapper.
 */
import classNames from 'classnames';
import type { ReactNode } from 'react';
import React from 'react';

import css from './AdminLayoutTopbar.module.scss';

type TAdminLayoutTopbar = {
  className?: string;
  rootClassName?: string;
  children: ReactNode;
};

const AdminLayoutTopbar = (props: TAdminLayoutTopbar) => {
  const { className, rootClassName, children } = props;
  const classes = classNames(rootClassName || css.root, className);

  return <div className={classes}>{children}</div>;
};

export default AdminLayoutTopbar;
