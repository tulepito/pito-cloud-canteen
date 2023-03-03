import React from 'react';
import classNames from 'classnames';

import type { TIconProps } from '@utils/types';

import css from './IconFilter.module.scss';

const IconFilter: React.FC<TIconProps> = (props) => {
  const { rootClassName, className } = props;

  return (
    <svg
      preserveAspectRatio="none"
      className={classNames(rootClassName, css.root, className)}
      viewBox="0 0 16 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6.40006 11.4951H1.14923C0.804231 11.4951 0.524231 11.2151 0.524231 10.8701C0.524231 10.5251 0.804231 10.2451 1.14923 10.2451H6.40006C6.74506 10.2451 7.02506 10.5251 7.02506 10.8701C7.02506 11.2151 6.74506 11.4951 6.40006 11.4951Z"
        fill="#262626"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M13.9924 3.41602H8.74237C8.39737 3.41602 8.11737 3.13602 8.11737 2.79102C8.11737 2.44602 8.39737 2.16602 8.74237 2.16602H13.9924C14.3374 2.16602 14.6174 2.44602 14.6174 2.79102C14.6174 3.13602 14.3374 3.41602 13.9924 3.41602Z"
        fill="#262626"
      />
      <mask
        id="mask0_4443_3690"
        maskUnits="userSpaceOnUse"
        x="0"
        y="0"
        width="6"
        height="6">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M0.5 0.166992H5.68817V5.32666H0.5V0.166992Z"
          fill="white"
        />
      </mask>
      <g mask="url(#mask0_4443_3690)">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M3.09398 1.41699C2.35315 1.41699 1.74982 2.01366 1.74982 2.74783C1.74982 3.48116 2.35315 4.07699 3.09398 4.07699C3.83565 4.07699 4.43815 3.48116 4.43815 2.74783C4.43815 2.01366 3.83565 1.41699 3.09398 1.41699ZM3.09398 5.32699C1.66398 5.32699 0.499817 4.17033 0.499817 2.74783C0.499817 1.32533 1.66398 0.166992 3.09398 0.166992C4.52482 0.166992 5.68815 1.32533 5.68815 2.74783C5.68815 4.17033 4.52482 5.32699 3.09398 5.32699Z"
          fill="#262626"
        />
      </g>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12.4897 9.50586C11.748 9.50586 11.1447 10.1025 11.1447 10.8359C11.1447 11.57 11.748 12.1659 12.4897 12.1659C13.2305 12.1659 13.833 11.57 13.833 10.8359C13.833 10.1025 13.2305 9.50586 12.4897 9.50586ZM12.4897 13.4159C11.0589 13.4159 9.89471 12.2584 9.89471 10.8359C9.89471 9.41336 11.0589 8.25586 12.4897 8.25586C13.9197 8.25586 15.083 9.41336 15.083 10.8359C15.083 12.2584 13.9197 13.4159 12.4897 13.4159Z"
        fill="#262626"
      />
    </svg>
  );
};

export default IconFilter;
