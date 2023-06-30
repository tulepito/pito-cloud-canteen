import type { ReactElement } from 'react';
import React from 'react';

import css from './PageHeader.module.scss';

const PageHeader = ({ children }: { children: ReactElement }) => {
  return <h1 className={css.root}>{children}</h1>;
};

export default PageHeader;
