import React from 'react';
import classNames from 'classnames';

import type { TIconProps } from '@utils/types';

import css from './IconDangerWithCircle.module.scss';

const IconDangerWithCircle: React.FC<TIconProps> = (props) => {
  const { className, onClick } = props;
  const classes = classNames(css.root, className);

  return (
    <svg
      className={classes}
      onClick={onClick}
      preserveAspectRatio="none"
      width="25"
      height="24"
      viewBox="0 0 25 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg">
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M12.5 3.5C7.813 3.5 4 7.313 4 12C4 16.687 7.813 20.5 12.5 20.5C17.187 20.5 21 16.687 21 12C21 7.313 17.187 3.5 12.5 3.5ZM12.5 22C6.986 22 2.5 17.514 2.5 12C2.5 6.486 6.986 2 12.5 2C18.014 2 22.5 6.486 22.5 12C22.5 17.514 18.014 22 12.5 22Z"
        fill="#262626"
      />
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M12.4922 13.3721C12.0782 13.3721 11.7422 13.0361 11.7422 12.6221V8.20312C11.7422 7.78912 12.0782 7.45312 12.4922 7.45312C12.9062 7.45312 13.2422 7.78912 13.2422 8.20312V12.6221C13.2422 13.0361 12.9062 13.3721 12.4922 13.3721Z"
        fill="#262626"
      />
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M12.505 16.7969C11.952 16.7969 11.5 16.3499 11.5 15.7969C11.5 15.2439 11.943 14.7969 12.495 14.7969H12.505C13.058 14.7969 13.505 15.2439 13.505 15.7969C13.505 16.3499 13.058 16.7969 12.505 16.7969Z"
        fill="#262626"
      />
    </svg>
  );
};

export default IconDangerWithCircle;
