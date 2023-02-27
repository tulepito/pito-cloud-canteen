import type { TIconProps } from '@utils/types';
import classNames from 'classnames';
import React from 'react';

import css from './IconPending.module.scss';

const IconPending: React.FC<TIconProps> = (props) => {
  const { className } = props;
  const classes = classNames(css.root, className);

  return (
    <svg
      className={classes}
      width="37"
      height="36"
      viewBox="0 0 37 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg">
      <rect x="4.5" y="4" width="28" height="28" rx="14" fill="#2F54EB" />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M18.5 10.75C14.4959 10.75 11.25 13.9959 11.25 18C11.25 22.0041 14.4959 25.25 18.5 25.25C22.5041 25.25 25.75 22.0041 25.75 18C25.75 13.9959 22.5041 10.75 18.5 10.75ZM9.75 18C9.75 13.1675 13.6675 9.25 18.5 9.25C23.3325 9.25 27.25 13.1675 27.25 18C27.25 22.8325 23.3325 26.75 18.5 26.75C13.6675 26.75 9.75 22.8325 9.75 18Z"
        fill="white"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M18.9707 13.0156C19.3849 13.0156 19.7207 13.3514 19.7207 13.7656V17.7215H22.7354C23.1496 17.7215 23.4854 18.0573 23.4854 18.4715C23.4854 18.8857 23.1496 19.2215 22.7354 19.2215H18.9707C18.5565 19.2215 18.2207 18.8857 18.2207 18.4715V13.7656C18.2207 13.3514 18.5565 13.0156 18.9707 13.0156Z"
        fill="white"
      />
    </svg>
  );
};

export default IconPending;
