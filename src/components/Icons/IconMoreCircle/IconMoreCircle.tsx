import React from 'react';
import classNames from 'classnames';

import type { TIconProps } from '@utils/types';

import css from './IconMoreCircle.module.scss';

const IconMoreCircle: React.FC<TIconProps> = (props) => {
  const { className, onClick } = props;
  const classes = classNames(css.root, className);

  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="none"
      onClick={onClick}
      className={classes}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 3.5C7.313 3.5 3.5 7.313 3.5 12C3.5 16.687 7.313 20.5 12 20.5C16.687 20.5 20.5 16.687 20.5 12C20.5 7.313 16.687 3.5 12 3.5ZM12 22C6.486 22 2 17.514 2 12C2 6.486 6.486 2 12 2C17.514 2 22 6.486 22 12C22 17.514 17.514 22 12 22Z"
        fill="#262626"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M15.9484 13.0156C15.3954 13.0156 14.9434 12.5686 14.9434 12.0156C14.9434 11.4626 15.3864 11.0156 15.9384 11.0156H15.9484C16.5014 11.0156 16.9484 11.4626 16.9484 12.0156C16.9484 12.5686 16.5014 13.0156 15.9484 13.0156Z"
        fill="#262626"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11.9386 13.0156C11.3856 13.0156 10.9346 12.5686 10.9346 12.0156C10.9346 11.4626 11.3766 11.0156 11.9296 11.0156H11.9386C12.4916 11.0156 12.9386 11.4626 12.9386 12.0156C12.9386 12.5686 12.4916 13.0156 11.9386 13.0156Z"
        fill="#262626"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7.9298 13.0156C7.3768 13.0156 6.9248 12.5686 6.9248 12.0156C6.9248 11.4626 7.3678 11.0156 7.9208 11.0156H7.9298C8.4828 11.0156 8.9298 11.4626 8.9298 12.0156C8.9298 12.5686 8.4828 13.0156 7.9298 13.0156Z"
        fill="#262626"
      />
    </svg>
  );
};

export default IconMoreCircle;
