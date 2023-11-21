import type { PropsWithChildren } from 'react';
import classNames from 'classnames';

import type { TDefaultProps } from '@src/utils/types';

import css from './MobileBottomContainer.module.scss';

type TMobileBottomContainerProps = PropsWithChildren<TDefaultProps>;

const MobileBottomContainer: React.FC<TMobileBottomContainerProps> = (
  props,
) => {
  const { rootClassName, className, children } = props;

  const rootClasses = classNames(rootClassName || css.root, className);

  return <div className={rootClasses}>{children}</div>;
};

export default MobileBottomContainer;
