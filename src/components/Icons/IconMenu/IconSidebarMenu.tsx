import type { TIconProps } from '@utils/types';
import classNames from 'classnames';
import React from 'react';

import css from './IconMenu.module.scss';

const IconSidebarMenu: React.FC<TIconProps> = (props) => {
  const { rootClassName, className, width = 25, height = 24, onClick } = props;
  const classes = classNames(rootClassName || css.root, className);

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 25 24"
      fill="none"
      className={classes}
      onClick={onClick}
      xmlns="http://www.w3.org/2000/svg">
      <path
        d="M3.71484 5.25C3.71484 4.83579 4.05063 4.5 4.46484 4.5H20.4648C20.879 4.5 21.2148 4.83579 21.2148 5.25C21.2148 5.66421 20.879 6 20.4648 6H4.46484C4.05063 6 3.71484 5.66421 3.71484 5.25Z"
        fill="black"
      />
      <path
        d="M11.7148 9.75C11.7148 9.33579 12.0506 9 12.4648 9H20.4648C20.879 9 21.2148 9.33579 21.2148 9.75C21.2148 10.1642 20.879 10.5 20.4648 10.5H12.4648C12.0506 10.5 11.7148 10.1642 11.7148 9.75Z"
        fill="black"
      />
      <path
        d="M11.7148 14.25C11.7148 13.8358 12.0506 13.5 12.4648 13.5H20.4648C20.879 13.5 21.2148 13.8358 21.2148 14.25C21.2148 14.6642 20.879 15 20.4648 15H12.4648C12.0506 15 11.7148 14.6642 11.7148 14.25Z"
        fill="black"
      />
      <path
        d="M3.71484 18.75C3.71484 18.3358 4.05063 18 4.46484 18H20.4648C20.879 18 21.2148 18.3358 21.2148 18.75C21.2148 19.1642 20.879 19.5 20.4648 19.5H4.46484C4.05063 19.5 3.71484 19.1642 3.71484 18.75Z"
        fill="black"
      />
      <path
        d="M8.82842 8.84402C9.06688 8.97619 9.21484 9.22736 9.21484 9.5V14.5C9.21484 14.7726 9.06688 15.0238 8.82842 15.156C8.58995 15.2882 8.29854 15.2805 8.06734 15.136L4.06734 12.636C3.84805 12.4989 3.71484 12.2586 3.71484 12C3.71484 11.7414 3.84805 11.5011 4.06734 11.364L8.06734 8.864C8.29854 8.7195 8.58995 8.71185 8.82842 8.84402ZM5.87994 12L7.71484 13.1468V10.8532L5.87994 12Z"
        fill="black"
      />
    </svg>
  );
};

export default IconSidebarMenu;
