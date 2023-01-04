import type { TIconProps } from '@utils/types';
import classNames from 'classnames';
import React from 'react';

import css from './IconUserManagement.module.scss';

const IconUserManagement = (props: TIconProps) => {
  const { className } = props;

  const classes = classNames(css.root, className);
  return (
    <svg
      className={classes}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg">
      <mask
        id="mask0_3330_1041"
        maskUnits="userSpaceOnUse"
        x="3"
        y="12"
        width="14"
        height="7">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M3.33325 12.0801H16.5332V18.2251H3.33325V12.0801Z"
          fill="white"
        />
      </mask>
      <g mask="url(#mask0_3330_1041)">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M9.93409 13.3301C6.38325 13.3301 4.58325 13.9401 4.58325 15.1442C4.58325 16.3592 6.38325 16.9751 9.93409 16.9751C13.4841 16.9751 15.2833 16.3651 15.2833 15.1609C15.2833 13.9459 13.4841 13.3301 9.93409 13.3301ZM9.93409 18.2251C8.30159 18.2251 3.33325 18.2251 3.33325 15.1442C3.33325 12.3976 7.10075 12.0801 9.93409 12.0801C11.5666 12.0801 16.5333 12.0801 16.5333 15.1609C16.5333 17.9076 12.7666 18.2251 9.93409 18.2251Z"
        />
      </g>
      <mask
        id="mask1_3330_1041"
        maskUnits="userSpaceOnUse"
        x="5"
        y="1"
        width="10"
        height="10">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M5.50806 1.66675H14.3581V10.5156H5.50806V1.66675Z"
          fill="white"
        />
      </mask>
      <g mask="url(#mask1_3330_1041)">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M9.93392 2.8565C8.14975 2.8565 6.69808 4.30734 6.69808 6.0915C6.69225 7.86984 8.13308 9.31984 9.90975 9.3265L9.93392 9.9215V9.3265C11.7172 9.3265 13.1681 7.87484 13.1681 6.0915C13.1681 4.30734 11.7172 2.8565 9.93392 2.8565ZM9.93392 10.5157H9.90725C7.47225 10.5082 5.49975 8.52234 5.50808 6.089C5.50808 3.6515 7.49308 1.6665 9.93392 1.6665C12.3739 1.6665 14.3581 3.6515 14.3581 6.0915C14.3581 8.5315 12.3739 10.5157 9.93392 10.5157Z"
        />
      </g>
    </svg>
  );
};

export default IconUserManagement;
