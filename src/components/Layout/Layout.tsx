import type { ReactNode } from 'react';
import React from 'react';

import TopBar from './components/TopBar';
import css from './Layout.module.scss';

type TLayoutProps = {
  children: ReactNode;
};

const Layout = ({ children }: TLayoutProps) => {
  return (
    <>
      <TopBar />
      <main className={css.main}>{children}</main>
    </>
  );
};

export default Layout;
