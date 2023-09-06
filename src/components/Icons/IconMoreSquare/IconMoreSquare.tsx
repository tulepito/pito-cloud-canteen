import React from 'react';
import classNames from 'classnames';

import type { TIconProps } from '@utils/types';

import css from './IconMoreSquare.module.scss';

const IconMoreSquare: React.FC<TIconProps> = (props) => {
  const { className } = props;
  const classes = classNames(css.root, className);

  return (
    <svg
      width="25"
      height="24"
      viewBox="0 0 25 24"
      fill="none"
      className={classes}
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7.79 3.5C5.26 3.5 3.625 5.233 3.625 7.916V16.084C3.625 18.767 5.26 20.5 7.79 20.5H16.458C18.989 20.5 20.625 18.767 20.625 16.084V7.916C20.625 5.233 18.989 3.5 16.459 3.5H7.79ZM16.458 22H7.79C4.401 22 2.125 19.622 2.125 16.084V7.916C2.125 4.378 4.401 2 7.79 2H16.459C19.848 2 22.125 4.378 22.125 7.916V16.084C22.125 19.622 19.848 22 16.458 22Z"
        fill="#8C8C8C"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M16.0734 13.0156C15.5204 13.0156 15.0684 12.5686 15.0684 12.0156C15.0684 11.4626 15.5114 11.0156 16.0634 11.0156H16.0734C16.6264 11.0156 17.0734 11.4626 17.0734 12.0156C17.0734 12.5686 16.6264 13.0156 16.0734 13.0156Z"
        fill="#8C8C8C"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12.0636 13.0156C11.5106 13.0156 11.0596 12.5686 11.0596 12.0156C11.0596 11.4626 11.5016 11.0156 12.0546 11.0156H12.0636C12.6166 11.0156 13.0636 11.4626 13.0636 12.0156C13.0636 12.5686 12.6166 13.0156 12.0636 13.0156Z"
        fill="#8C8C8C"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8.0548 13.0156C7.5018 13.0156 7.0498 12.5686 7.0498 12.0156C7.0498 11.4626 7.4928 11.0156 8.0458 11.0156H8.0548C8.6078 11.0156 9.0548 11.4626 9.0548 12.0156C9.0548 12.5686 8.6078 13.0156 8.0548 13.0156Z"
        fill="#8C8C8C"
      />
    </svg>
  );
};

export default IconMoreSquare;
