import React from 'react';
import classNames from 'classnames';

import type { TIconProps } from '@utils/types';

import css from './IconMoreCircle.module.scss';

const IconMoreCircle: React.FC<TIconProps> = (props) => {
  const { className, onClick } = props;
  const classes = classNames(css.root, className);

  return (
    <svg
      onClick={onClick}
      className={classes}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 3.5C7.313 3.5 3.5 7.313 3.5 12C3.5 16.687 7.313 20.5 12 20.5C16.687 20.5 20.5 16.687 20.5 12C20.5 7.313 16.687 3.5 12 3.5ZM12 22C6.486 22 2 17.514 2 12C2 6.486 6.486 2 12 2C17.514 2 22 6.486 22 12C22 17.514 17.514 22 12 22Z"
        fill="#262626"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M15.9482 13.0156C15.3952 13.0156 14.9432 12.5686 14.9432 12.0156C14.9432 11.4626 15.3862 11.0156 15.9382 11.0156H15.9482C16.5012 11.0156 16.9482 11.4626 16.9482 12.0156C16.9482 12.5686 16.5012 13.0156 15.9482 13.0156Z"
        fill="#262626"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11.9384 13.0156C11.3854 13.0156 10.9344 12.5686 10.9344 12.0156C10.9344 11.4626 11.3764 11.0156 11.9294 11.0156H11.9384C12.4914 11.0156 12.9384 11.4626 12.9384 12.0156C12.9384 12.5686 12.4914 13.0156 11.9384 13.0156Z"
        fill="#262626"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7.92968 13.0156C7.37668 13.0156 6.92468 12.5686 6.92468 12.0156C6.92468 11.4626 7.36768 11.0156 7.92068 11.0156H7.92968C8.48268 11.0156 8.92968 11.4626 8.92968 12.0156C8.92968 12.5686 8.48268 13.0156 7.92968 13.0156Z"
        fill="#262626"
      />
    </svg>
  );
};

export default IconMoreCircle;
