/**
 * This is a wrapper component for different Layouts.
 * Topbar should be added to this wrapper.
 */
import classNames from 'classnames';
import type { PropsWithChildren } from 'react';
import React from 'react';

import css from './AdminLayoutTopbar.module.scss';

type TAdminLayoutTopbarProps = PropsWithChildren<{
  rootClassName?: string;
  className?: string;
}>;

const AdminLayoutTopbar: React.FC<TAdminLayoutTopbarProps> = (props) => {
  const { className, rootClassName, children } = props;
  const classes = classNames(rootClassName || css.root, className);

  return <div className={classes}>{children}</div>;
};

export default AdminLayoutTopbar;
