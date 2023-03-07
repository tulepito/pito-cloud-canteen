import type { PropsWithChildren } from 'react';
import classNames from 'classnames';

import css from './Layout.module.scss';

type TLayoutProps = PropsWithChildren<{
  className?: string;
}>;

const Layout: React.FC<TLayoutProps> = ({ className, children }) => {
  const classes = classNames(css.root, className);
  return <div className={classes}>{children}</div>;
};

export default Layout;
