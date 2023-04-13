import React from 'react';
import classNames from 'classnames';

import type { TIconProps } from '@utils/types';

import css from './IconLightOutline.module.scss';

const IconLightOutline: React.FC<TIconProps> = (props) => {
  const { rootClassName, className, onClick } = props;
  const classes = classNames(rootClassName || css.root, className);

  return (
    <svg
      className={classes}
      width={25}
      height={24}
      viewBox="0 0 25 24"
      fill="none"
      onClick={onClick}
      xmlns="http://www.w3.org/2000/svg">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12.5 3.5C7.813 3.5 4 7.313 4 12C4 16.687 7.813 20.5 12.5 20.5C17.187 20.5 21 16.687 21 12C21 7.313 17.187 3.5 12.5 3.5ZM12.5 22C6.986 22 2.5 17.514 2.5 12C2.5 6.486 6.986 2 12.5 2C18.014 2 22.5 6.486 22.5 12C22.5 17.514 18.014 22 12.5 22Z"
        fill="#8C8C8C"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M16.4484 13.0156C15.8954 13.0156 15.4434 12.5686 15.4434 12.0156C15.4434 11.4626 15.8864 11.0156 16.4384 11.0156H16.4484C17.0014 11.0156 17.4484 11.4626 17.4484 12.0156C17.4484 12.5686 17.0014 13.0156 16.4484 13.0156Z"
        fill="#8C8C8C"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12.4386 13.0156C11.8856 13.0156 11.4346 12.5686 11.4346 12.0156C11.4346 11.4626 11.8766 11.0156 12.4296 11.0156H12.4386C12.9916 11.0156 13.4386 11.4626 13.4386 12.0156C13.4386 12.5686 12.9916 13.0156 12.4386 13.0156Z"
        fill="#8C8C8C"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8.4298 13.0156C7.8768 13.0156 7.4248 12.5686 7.4248 12.0156C7.4248 11.4626 7.8678 11.0156 8.4208 11.0156H8.4298C8.9828 11.0156 9.4298 11.4626 9.4298 12.0156C9.4298 12.5686 8.9828 13.0156 8.4298 13.0156Z"
        fill="#8C8C8C"
      />
    </svg>
  );
};

export default IconLightOutline;
