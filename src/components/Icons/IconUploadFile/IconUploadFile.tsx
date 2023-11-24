import React from 'react';
import classNames from 'classnames';

import type { TIconProps } from '@utils/types';

import css from './IconUploadFile.module.scss';

const IconUploadFile = (props: TIconProps) => {
  return (
    <svg
      className={classNames(css.root, props.className)}
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="none">
      <mask
        id="mask0_160_10138"
        style={{ maskType: 'luminance' }}
        maskUnits="userSpaceOnUse"
        x="1"
        y="7"
        width="18"
        height="12">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M1.66699 7.32751H18.3333V18.7808H1.66699V7.32751Z"
          fill="white"
        />
      </mask>
      <g mask="url(#mask0_160_10138)">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M14.6378 18.7808H5.36283C3.32533 18.7808 1.66699 17.1233 1.66699 15.085V11.0225C1.66699 8.98501 3.32533 7.32751 5.36283 7.32751H6.14033C6.48533 7.32751 6.76533 7.60751 6.76533 7.95251C6.76533 8.29751 6.48533 8.57751 6.14033 8.57751H5.36283C4.01366 8.57751 2.91699 9.67418 2.91699 11.0225V15.085C2.91699 16.4342 4.01366 17.5308 5.36283 17.5308H14.6378C15.9862 17.5308 17.0837 16.4342 17.0837 15.085V11.015C17.0837 9.67085 15.9903 8.57751 14.647 8.57751H13.8612C13.5162 8.57751 13.2362 8.29751 13.2362 7.95251C13.2362 7.60751 13.5162 7.32751 13.8612 7.32751H14.647C16.6795 7.32751 18.3337 8.98168 18.3337 11.015V15.085C18.3337 17.1233 16.6753 18.7808 14.6378 18.7808Z"
          fill="#262626"
        />
      </g>
      <mask
        id="mask1_160_10138"
        style={{ maskType: 'luminance' }}
        maskUnits="userSpaceOnUse"
        x="9"
        y="1"
        width="2"
        height="12">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M9.375 1.66675H10.625V12.9508H9.375V1.66675Z"
          fill="white"
        />
      </mask>
      <g mask="url(#mask1_160_10138)">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M10 12.9508C9.655 12.9508 9.375 12.6708 9.375 12.3258V2.29163C9.375 1.94663 9.655 1.66663 10 1.66663C10.345 1.66663 10.625 1.94663 10.625 2.29163V12.3258C10.625 12.6708 10.345 12.9508 10 12.9508Z"
          fill="#262626"
        />
      </g>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7.57059 5.35593C7.41143 5.35593 7.25143 5.29509 7.12976 5.17343C6.88559 4.93009 6.88393 4.53509 7.12809 4.29009L9.55726 1.85009C9.79143 1.61426 10.2081 1.61426 10.4423 1.85009L12.8723 4.29009C13.1156 4.53509 13.1148 4.93009 12.8706 5.17343C12.6256 5.41676 12.2306 5.41676 11.9873 5.17176L9.99976 3.17676L8.01309 5.17176C7.89143 5.29509 7.73059 5.35593 7.57059 5.35593Z"
        fill="#262626"
      />
    </svg>
  );
};

export default IconUploadFile;
