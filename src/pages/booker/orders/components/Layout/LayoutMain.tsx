import classNames from 'classnames';
import type { PropsWithChildren } from 'react';

import css from './Layout.module.scss';

type TLayoutMainProps = PropsWithChildren<{
  className?: string;
}>;

const LayoutMain: React.FC<TLayoutMainProps> = ({ className, children }) => {
  const classes = classNames(css.layoutMain, className);
  return <div className={classes}>{children}</div>;
};

export default LayoutMain;
