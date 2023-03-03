import React from 'react';
import classNames from 'classnames';

import type { TIconProps } from '@utils/types';

import css from './IconDanger.module.scss';

const IconDanger: React.FC<TIconProps> = (props) => {
  const { className } = props;
  const classes = classNames(css.root, className);
  return (
    <svg
      className={classes}
      width="27"
      height="25"
      viewBox="0 0 27 25"
      fill="none"
      xmlns="http://www.w3.org/2000/svg">
      <mask
        id="mask0_5348_30341"
        maskUnits="userSpaceOnUse"
        x="0"
        y="0"
        width="27"
        height="25">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M0.131592 0H26.8165V24.2473H0.131592V0Z"
          fill="white"
        />
      </mask>
      <g mask="url(#mask0_5348_30341)">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M13.4818 2C12.8471 2 12.2818 2.328 11.9645 2.87867L2.36712 19.632C2.05512 20.1787 2.05779 20.8307 2.37379 21.376C2.68979 21.9213 3.25512 22.248 3.88579 22.248H23.0631C23.6925 22.248 24.2578 21.9213 24.5738 21.376C24.8911 20.8307 24.8938 20.1787 24.5791 19.632L14.9991 2.87867C14.6831 2.328 14.1178 2 13.4818 2M23.0631 24.248H3.88579C2.53379 24.248 1.32179 23.5493 0.643121 22.3787C-0.0355454 21.2093 -0.0395454 19.8107 0.631121 18.6387L10.2311 1.884C10.9058 0.704 12.1205 0 13.4818 0H13.4831C14.8431 0 16.0605 0.705333 16.7351 1.88667L26.3165 18.6387C26.9871 19.8107 26.9831 21.2093 26.3045 22.3787C25.6258 23.5493 24.4138 24.248 23.0631 24.248"
          fill="#CF1332"
        />
      </g>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M13.4702 14.8833C12.9182 14.8833 12.4702 14.4353 12.4702 13.8833V9.75C12.4702 9.198 12.9182 8.75 13.4702 8.75C14.0222 8.75 14.4702 9.198 14.4702 9.75V13.8833C14.4702 14.4353 14.0222 14.8833 13.4702 14.8833Z"
        fill="#CF1332"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M13.4728 19.3334C12.7355 19.3334 12.1328 18.7374 12.1328 18.0001C12.1328 17.2627 12.7235 16.6667 13.4595 16.6667H13.4728C14.2101 16.6667 14.8061 17.2627 14.8061 18.0001C14.8061 18.7374 14.2101 19.3334 13.4728 19.3334Z"
        fill="#CF1332"
      />
    </svg>
  );
};

export default IconDanger;
