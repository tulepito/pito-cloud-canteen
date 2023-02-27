import type { TIconProps } from '@utils/types';
import classNames from 'classnames';
import React from 'react';

import css from './IconFail.module.scss';

const IconFail: React.FC<TIconProps> = (props) => {
  const { className } = props;
  const classes = classNames(css.root, className);

  return (
    <svg
      className={classes}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg">
      <g clipPath="url(#clip0_6183_3411)">
        <path
          d="M20.4853 20.4853C25.1716 15.799 25.1716 8.20101 20.4853 3.51472C15.799 -1.17157 8.20101 -1.17157 3.51472 3.51472C-1.17157 8.20101 -1.17157 15.799 3.51472 20.4853C8.20101 25.1716 15.799 25.1716 20.4853 20.4853Z"
          fill="#FFB13D"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M12.0033 15.6212C11.737 15.6212 11.5091 15.3939 11.4629 15.0814L10.1007 5.89381C9.92944 4.73673 10.677 3.67603 11.6634 3.67603H12.3426C13.329 3.67603 14.0766 4.73673 13.9053 5.89381L12.5431 15.0814C12.4975 15.3939 12.2696 15.6212 12.0033 15.6212Z"
          fill="white"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M13.2484 19.0776C13.2484 18.3913 12.6884 17.8313 12.0021 17.8313C11.3158 17.8313 10.7559 18.3913 10.7559 19.0776C10.7559 19.7639 11.3158 20.3239 12.0021 20.3239C12.6884 20.3239 13.2484 19.7645 13.2484 19.0776Z"
          fill="white"
        />
      </g>
      <defs>
        <clipPath id="clip0_6183_3411">
          <rect width="24" height="24" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};

export default IconFail;
