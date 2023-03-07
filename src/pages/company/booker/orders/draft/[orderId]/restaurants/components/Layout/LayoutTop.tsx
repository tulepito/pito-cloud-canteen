import type { PropsWithChildren } from 'react';

import css from './Layout.module.scss';

const LayoutTop: React.FC<PropsWithChildren> = ({ children }) => {
  return <div className={css.top}>{children}</div>;
};

export default LayoutTop;
