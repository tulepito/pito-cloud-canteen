import type { TIconProps } from '@utils/types';
import classNames from 'classnames';
import React from 'react';

import css from './IconBell.module.scss';

const IconBell: React.FC<TIconProps> = (props) => {
  const { className } = props;
  const classes = classNames(css.root, className);
  return (
    <svg
      className={classes}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      strokeWidth="0.1">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M20.9394 17H19.9994V10C19.9994 5.58172 16.4177 2 11.9994 2C7.5811 2 3.99937 5.58172 3.99937 10V17H3.10938C2.55709 17 2.10938 17.4477 2.10938 18C2.10938 18.5523 2.55709 19 3.10938 19H8.99937C8.99937 20.6569 10.3425 22 11.9994 22C13.6562 22 14.9994 20.6569 14.9994 19H20.9394C21.4917 19 21.9394 18.5523 21.9394 18C21.9394 17.4477 21.4917 17 20.9394 17ZM11.9994 20C11.4471 20 10.9994 19.5523 10.9994 19H12.9994C12.9994 19.5523 12.5517 20 11.9994 20ZM5.99938 17H13.9994H17.9994V10C17.9994 6.68629 15.3131 4 11.9994 4C8.68567 4 5.99938 6.68629 5.99938 10V17Z"
        fill="#212121"
      />
    </svg>
  );
};

export default IconBell;
