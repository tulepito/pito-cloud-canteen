import React from 'react';
import classNames from 'classnames';

import type { TIconProps } from '@utils/types';

import css from './IconCamera.module.scss';

const IconCamera: React.FC<TIconProps> = (props) => {
  const { className } = props;
  const classes = classNames(css.root, className);

  return (
    <svg
      className={classes}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M15.0402 4.05132C16.0502 4.45332 16.3592 5.85332 16.7722 6.30332C17.1852 6.75332 17.7762 6.90632 18.1032 6.90632C19.8412 6.90632 21.2502 8.31532 21.2502 10.0523V15.8473C21.2502 18.1773 19.3602 20.0673 17.0302 20.0673H6.97024C4.63924 20.0673 2.75024 18.1773 2.75024 15.8473V10.0523C2.75024 8.31532 4.15924 6.90632 5.89724 6.90632C6.22324 6.90632 6.81424 6.75332 7.22824 6.30332C7.64124 5.85332 7.94924 4.45332 8.95924 4.05132C9.97024 3.64932 14.0302 3.64932 15.0402 4.05132Z"
        stroke="#130F26"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M17.4955 9.5H17.5045"
        stroke="#130F26"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M15.179 13.128C15.179 11.372 13.756 9.94904 12 9.94904C10.244 9.94904 8.82104 11.372 8.82104 13.128C8.82104 14.884 10.244 16.307 12 16.307C13.756 16.307 15.179 14.884 15.179 13.128Z"
        stroke="#130F26"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default IconCamera;
