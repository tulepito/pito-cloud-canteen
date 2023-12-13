import type { PropsWithChildren } from 'react';
import React from 'react';
import classNames from 'classnames';

import css from './Layout.module.scss';

type TLayout = PropsWithChildren & {
  className?: string;
};

const Layout: React.FC<TLayout> = ({ children, className }) => {
  const classes = classNames(css.layout, className);

  return <div className={classes}>{children}</div>;
};

export default Layout;
