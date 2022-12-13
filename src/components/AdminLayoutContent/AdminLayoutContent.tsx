/**
 * This is a wrapper component for different Layouts. Main content should be added to this wrapper.
 */
import classNames from 'classnames';
import React from 'react';

import css from './AdminLayoutContent.module.scss';

const AdminLayoutContent = (props: any) => {
  const { className, rootClassName, children } = props;
  const classes = classNames(rootClassName || css.root, className);

  return (
    <div className={classes} role="main">
      {children}
    </div>
  );
};

export default AdminLayoutContent;
