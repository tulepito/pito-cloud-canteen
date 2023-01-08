import type { TIconProps } from '@utils/types';
import classNames from 'classnames';
import React from 'react';

import css from './IconMenuArrow.module.scss';

const IconMenuArrow: React.FC<TIconProps> = (props) => {
  const { rootClassName, className } = props;
  const classes = classNames(rootClassName, css.root, className);

  return (
    <svg
      preserveAspectRatio="none"
      className={classes}
      clipRule="evenodd"
      fillRule="evenodd"
      strokeLinejoin="round"
      strokeMiterlimit="2"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg">
      <path d="m16.843 10.211c.108-.141.157-.3.157-.456 0-.389-.306-.755-.749-.755h-8.501c-.445 0-.75.367-.75.755 0 .157.05.316.159.457 1.203 1.554 3.252 4.199 4.258 5.498.142.184.36.29.592.29.23 0 .449-.107.591-.291 1.002-1.299 3.044-3.945 4.243-5.498z" />
    </svg>
  );
};

export default IconMenuArrow;
