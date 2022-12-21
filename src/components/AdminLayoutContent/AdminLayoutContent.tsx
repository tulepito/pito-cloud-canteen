/**
 * This is a wrapper component for different Layouts. Main content should be added to this wrapper.
 */
import classNames from 'classnames';
import React from 'react';

import css from './AdminLayoutContent.module.scss';

const AdminLayoutContent = (props: any) => {
  const { className, rootClassName, children, isMenuOpen } = props;
  const classes = classNames(rootClassName || css.root, className, {
    [css.menuOpen]: isMenuOpen,
  });

  return (
    <div className={classes} role="main">
      <div className={css.container}>{children}</div>
    </div>
  );
};

export default AdminLayoutContent;
