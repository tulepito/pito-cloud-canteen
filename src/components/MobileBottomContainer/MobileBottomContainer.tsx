import classNames from 'classnames';

import type { TDefaultProps } from '@src/utils/types';

import css from './MobileBottomContainer.module.scss';

type TMobileBottomContainerProps = {} & TDefaultProps;

const MobileBottomContainer: React.FC<TMobileBottomContainerProps> = (
  props,
) => {
  const { rootClassName, className } = props;

  const rootClasses = classNames(rootClassName || css.root, className);

  return <div className={rootClasses}></div>;
};

export default MobileBottomContainer;
