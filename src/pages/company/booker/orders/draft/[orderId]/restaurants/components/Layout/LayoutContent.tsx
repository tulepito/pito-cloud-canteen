import classNames from 'classnames';
import type { PropsWithChildren } from 'react';
import React from 'react';

import css from './Layout.module.scss';

type TLayoutContentProps = PropsWithChildren<{
  className?: string;
}>;

const LayoutContent: React.FC<TLayoutContentProps> = ({
  children,
  className,
}) => {
  return <div className={classNames(css.content, className)}>{children}</div>;
};

export default LayoutContent;
