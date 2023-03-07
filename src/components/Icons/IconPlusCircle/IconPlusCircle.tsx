import React from 'react';
import classNames from 'classnames';

import type { TIconProps } from '@utils/types';

import css from './IconPlusCircle.module.scss';

const IconPlusCircle: React.FC<TIconProps> = (props) => {
  const { className, onClick } = props;
  const classes = classNames(css.root, className);

  return (
    <svg
      className={classes}
      width={29}
      height={28}
      onClick={onClick}
      preserveAspectRatio="none"
      viewBox="0 0 29 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M14.9453 3.5875C9.20374 3.5875 4.53281 8.25843 4.53281 14C4.53281 19.7416 9.20374 24.4125 14.9453 24.4125C20.6869 24.4125 25.3578 19.7416 25.3578 14C25.3578 8.25843 20.6869 3.5875 14.9453 3.5875ZM14.9453 26.25C8.19066 26.25 2.69531 20.7547 2.69531 14C2.69531 7.24535 8.19066 1.75 14.9453 1.75C21.7 1.75 27.1953 7.24535 27.1953 14C27.1953 20.7547 21.7 26.25 14.9453 26.25Z"
        fill="#EF3D2A"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M14.9451 19.4068C14.438 19.4068 14.0264 18.9952 14.0264 18.4881V9.5125C14.0264 9.00535 14.438 8.59375 14.9451 8.59375C15.4523 8.59375 15.8639 9.00535 15.8639 9.5125V18.4881C15.8639 18.9952 15.4523 19.4068 14.9451 19.4068Z"
        fill="#EF3D2A"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M19.4366 14.9186H10.4537C9.94529 14.9186 9.53491 14.507 9.53491 13.9998C9.53491 13.4927 9.94529 13.0811 10.4537 13.0811H19.4366C19.9437 13.0811 20.3553 13.4927 20.3553 13.9998C20.3553 14.507 19.9437 14.9186 19.4366 14.9186Z"
        fill="#EF3D2A"
      />
    </svg>
  );
};

export default IconPlusCircle;
