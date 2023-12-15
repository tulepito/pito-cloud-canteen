import React from 'react';
import classNames from 'classnames';

import type { TIconProps } from '@src/utils/types';

import css from './IconSharing.module.scss';

const IconSharing: React.FC<TIconProps> = (props) => {
  const { className, rootClassName } = props;
  const classes = classNames(rootClassName || css.root, className);

  return (
    <svg
      className={classes}
      width={19}
      height={18}
      viewBox="0 0 19 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg">
      <path
        d="M14.7734 11.6719C13.7314 11.6719 12.8131 12.1845 12.2363 12.964L7.24965 10.4106C7.33244 10.1284 7.39062 9.83595 7.39062 9.52734C7.39062 9.10877 7.30481 8.71084 7.15655 8.34483L12.3753 5.20439C12.9561 5.886 13.8098 6.32812 14.7734 6.32812C16.5182 6.32812 17.9375 4.90883 17.9375 3.16406C17.9375 1.41929 16.5182 0 14.7734 0C13.0287 0 11.6094 1.41929 11.6094 3.16406C11.6094 3.56614 11.6922 3.94755 11.8295 4.30165L6.59521 7.4513C6.01493 6.78994 5.17357 6.36328 4.22656 6.36328C2.48179 6.36328 1.0625 7.78257 1.0625 9.52734C1.0625 11.2721 2.48179 12.6914 4.22656 12.6914C5.28582 12.6914 6.21961 12.1637 6.7942 11.3623L11.7645 13.9074C11.6729 14.2029 11.6094 14.5107 11.6094 14.8359C11.6094 16.5807 13.0287 18 14.7734 18C16.5182 18 17.9375 16.5807 17.9375 14.8359C17.9375 13.0912 16.5182 11.6719 14.7734 11.6719Z"
        fill="#262626"
      />
    </svg>
  );
};

export default IconSharing;
