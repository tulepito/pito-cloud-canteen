import type { PropsWithChildren } from 'react';
import React from 'react';

import css from './Layout.module.scss';

const Layout: React.FC<PropsWithChildren> = ({ children }) => {
  return <div className={css.layout}>{children}</div>;
};

export default Layout;
