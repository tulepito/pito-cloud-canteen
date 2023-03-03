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
      xmlns="http://www.w3.org/2000/svg">
      <mask
        id="mask0_4443_3703"
        maskUnits="userSpaceOnUse"
        x="1"
        y="7"
        width="18"
        height="12">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M1.66699 7.32812H18.3333V18.7815H1.66699V7.32812Z"
          fill="white"
        />
      </mask>
      <g mask="url(#mask0_4443_3703)">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M14.6378 18.7815H5.36283C3.32533 18.7815 1.66699 17.124 1.66699 15.0856V11.0231C1.66699 8.98563 3.32533 7.32812 5.36283 7.32812H6.14033C6.48533 7.32812 6.76533 7.60813 6.76533 7.95312C6.76533 8.29813 6.48533 8.57812 6.14033 8.57812H5.36283C4.01366 8.57812 2.91699 9.67479 2.91699 11.0231V15.0856C2.91699 16.4348 4.01366 17.5315 5.36283 17.5315H14.6378C15.9862 17.5315 17.0837 16.4348 17.0837 15.0856V11.0156C17.0837 9.67146 15.9903 8.57812 14.647 8.57812H13.8612C13.5162 8.57812 13.2362 8.29813 13.2362 7.95312C13.2362 7.60813 13.5162 7.32812 13.8612 7.32812H14.647C16.6795 7.32812 18.3337 8.98229 18.3337 11.0156V15.0856C18.3337 17.124 16.6753 18.7815 14.6378 18.7815Z"
          fill="#262626"
        />
      </g>
      <mask
        id="mask1_4443_3703"
        maskUnits="userSpaceOnUse"
        x="9"
        y="1"
        width="2"
        height="12">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M9.375 1.66699H10.625V12.9511H9.375V1.66699Z"
          fill="white"
        />
      </mask>
      <g mask="url(#mask1_4443_3703)">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M10 12.9512C9.655 12.9512 9.375 12.6712 9.375 12.3262V2.29199C9.375 1.94699 9.655 1.66699 10 1.66699C10.345 1.66699 10.625 1.94699 10.625 2.29199V12.3262C10.625 12.6712 10.345 12.9512 10 12.9512Z"
          fill="#262626"
        />
      </g>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7.57084 5.35654C7.41167 5.35654 7.25167 5.2957 7.13001 5.17404C6.88584 4.9307 6.88417 4.5357 7.12834 4.2907L9.55751 1.8507C9.79167 1.61487 10.2083 1.61487 10.4425 1.8507L12.8725 4.2907C13.1158 4.5357 13.115 4.9307 12.8708 5.17404C12.6258 5.41737 12.2308 5.41737 11.9875 5.17237L10 3.17737L8.01334 5.17237C7.89167 5.2957 7.73084 5.35654 7.57084 5.35654Z"
        fill="#262626"
      />
    </svg>
  );
};

export default IconUploadFile;
