import type { PropsWithChildren } from 'react';
import classNames from 'classnames';

import css from './Layout.module.scss';

type TLayoutTop = PropsWithChildren & {
  className?: string;
};

const LayoutTop: React.FC<TLayoutTop> = ({ children, className }) => {
  const classes = classNames(css.top, className);

  return <div className={classes}>{children}</div>;
};

export default LayoutTop;
