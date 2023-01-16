/**
 * This is a wrapper component for different Layouts. Main content should be added to this wrapper.
 */
import { BreadCrumbs } from '@components/AdminBreadCrumbs/AdminBreadCrumbs';
import classNames from 'classnames';
import type { ReactNode } from 'react';
import React from 'react';

import css from './AdminLayoutContent.module.scss';

type TAdminLayoutContent = {
  className?: string;
  rootClassName?: string;
  children: ReactNode;
  isMenuOpen: boolean;
};

const AdminLayoutContent = (props: TAdminLayoutContent) => {
  const { className, rootClassName, children, isMenuOpen } = props;
  const classes = classNames(rootClassName || css.root, className, {
    [css.menuOpen]: isMenuOpen,
  });

  return (
    <div className={classes} role="main">
      <BreadCrumbs />
      <div className={css.container}>{children}</div>
    </div>
  );
};

export default AdminLayoutContent;
