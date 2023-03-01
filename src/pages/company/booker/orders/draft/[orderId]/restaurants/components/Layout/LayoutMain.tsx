import classNames from 'classnames';
import type { PropsWithChildren } from 'react';
import React from 'react';

import css from './Layout.module.scss';

type TLayoutMainProps = PropsWithChildren<{
  className?: string;
}>;

const LayoutMain: React.FC<TLayoutMainProps> = ({ children, className }) => {
  return (
    <div className={classNames(css.mainContainer, className)}>{children}</div>
  );
};

export default LayoutMain;
