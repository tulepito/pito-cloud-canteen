import React from 'react';
import classNames from 'classnames';

import type { TIconProps } from '@utils/types';

import css from './IconPlusCircle.module.scss';

const IconPlusCircle: React.FC<TIconProps> = (props) => {
  const { className, onClick } = props;
  const classes = classNames(css.root, className);

  return (
    <svg
      className={classes}
      onClick={onClick}
      width={28}
      height={28}
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M14 3.5875C8.25843 3.5875 3.5875 8.25843 3.5875 14C3.5875 19.7416 8.25843 24.4125 14 24.4125C19.7416 24.4125 24.4125 19.7416 24.4125 14C24.4125 8.25843 19.7416 3.5875 14 3.5875ZM14 26.25C7.24535 26.25 1.75 20.7547 1.75 14C1.75 7.24535 7.24535 1.75 14 1.75C20.7547 1.75 26.25 7.24535 26.25 14C26.25 20.7547 20.7547 26.25 14 26.25Z"
        fill="#EF3D2A"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M13.9999 19.4068C13.4928 19.4068 13.0812 18.9952 13.0812 18.4881V9.5125C13.0812 9.00535 13.4928 8.59375 13.9999 8.59375C14.5071 8.59375 14.9187 9.00535 14.9187 9.5125V18.4881C14.9187 18.9952 14.5071 19.4068 13.9999 19.4068Z"
        fill="#EF3D2A"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M18.4914 14.9186H9.50847C9.0001 14.9186 8.58972 14.507 8.58972 13.9998C8.58972 13.4927 9.0001 13.0811 9.50847 13.0811H18.4914C18.9985 13.0811 19.4101 13.4927 19.4101 13.9998C19.4101 14.507 18.9985 14.9186 18.4914 14.9186Z"
        fill="#EF3D2A"
      />
    </svg>
  );
};

export default IconPlusCircle;
