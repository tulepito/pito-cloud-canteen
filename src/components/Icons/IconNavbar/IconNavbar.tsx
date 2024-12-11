import React from 'react';
import classNames from 'classnames';

import type { TIconProps } from '@utils/types';

import css from './IconNavbar.module.scss';

const IconNavbar: React.FC<TIconProps> = (props) => {
  const { className } = props;
  const classes = classNames(css.root, className);

  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      className={classes}
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg">
      <path
        d="M3 7H21"
        stroke="#262626"
        stroke-width="1.5"
        stroke-linecap="round"
      />
      <path
        d="M3 12H21"
        stroke="#262626"
        stroke-width="1.5"
        stroke-linecap="round"
      />
      <path
        d="M3 17H21"
        stroke="#262626"
        stroke-width="1.5"
        stroke-linecap="round"
      />
    </svg>
  );
};

export default IconNavbar;
