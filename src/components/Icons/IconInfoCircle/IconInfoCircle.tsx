import React from 'react';
import classNames from 'classnames';

import type { TIconProps } from '@utils/types';

import css from './IconInfoCircle.module.scss';

const IconInfoCircle: React.FC<TIconProps> = (props) => {
  const { className } = props;
  const classes = classNames(css.root, className);

  return (
    <svg
      className={classes}
      xmlns="http://www.w3.org/2000/svg"
      width={16}
      height={16}
      viewBox="0 0 16 16"
      fill="none">
      <g clipPath="url(#clip0_1_45195)">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M1.66602 7.99984C1.66602 11.4976 4.50155 14.3332 7.99935 14.3332C11.4972 14.3332 14.3327 11.4976 14.3327 7.99984C14.3327 4.50203 11.4972 1.6665 7.99935 1.6665C4.50155 1.6665 1.66602 4.50203 1.66602 7.99984ZM0.666016 7.99984C0.666016 12.0499 3.94926 15.3332 7.99935 15.3332C12.0494 15.3332 15.3327 12.0499 15.3327 7.99984C15.3327 3.94975 12.0494 0.666504 7.99935 0.666504C3.94926 0.666504 0.666016 3.94975 0.666016 7.99984ZM8.66602 10.3332V7.6665C8.66602 7.29831 8.36754 6.99984 7.99935 6.99984C7.63116 6.99984 7.33268 7.29831 7.33268 7.6665V10.3332C7.33268 10.7014 7.63116 10.9998 7.99935 10.9998C8.36754 10.9998 8.66602 10.7014 8.66602 10.3332ZM8.47075 5.1951C8.7311 5.45545 8.7311 5.87756 8.47075 6.13791C8.2104 6.39826 7.78829 6.39826 7.52794 6.13791C7.2676 5.87756 7.2676 5.45545 7.52794 5.1951C7.78829 4.93475 8.2104 4.93475 8.47075 5.1951Z"
          fill="#8C8C8C"
        />
      </g>
      <defs>
        <clipPath id="clip0_1_45195">
          <rect width={16} height={16} fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};

export default IconInfoCircle;
