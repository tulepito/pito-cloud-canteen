import type { PropsWithChildren } from 'react';
import React from 'react';
import classNames from 'classnames';

import css from './Layout.module.scss';

const LayoutSidebar: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <>
      <div className={classNames(css.sidebar)}>{children}</div>
    </>
  );
};

export default LayoutSidebar;
