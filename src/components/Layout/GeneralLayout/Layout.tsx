import type { PropsWithChildren } from 'react';
import React from 'react';

import GeneralLayoutTopBar from './GeneralLayoutTopBar/GeneralLayoutTopBar';

import css from './Layout.module.scss';

const GeneralLayout: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <>
      <GeneralLayoutTopBar />
      <main className={css.main}>{children}</main>
    </>
  );
};

export default GeneralLayout;
