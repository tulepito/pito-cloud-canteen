import React from 'react';
import classNames from 'classnames';

import type { TIconProps } from '@src/utils/types';

import css from './IconDish.module.scss';

const IconDish: React.FC<TIconProps> = (props) => {
  const { className, rootClassName } = props;
  const classes = classNames(rootClassName || css.root, className);

  return (
    <svg
      className={classes}
      width="28"
      height="28"
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M14.0003 6.125C14.7091 6.125 15.2837 5.53737 15.2837 4.8125C15.2837 4.08763 14.7091 3.5 14.0003 3.5C13.2916 3.5 12.717 4.08763 12.717 4.8125C12.717 5.53737 13.2916 6.125 14.0003 6.125ZM4.78394 17.9375C5.40909 13.3033 9.29719 9.73438 14.0003 9.73438C18.7035 9.73438 22.5916 13.3033 23.2167 17.9375H4.78394ZM2.84369 17.9375C3.48051 12.2129 8.2326 7.76562 14.0003 7.76562C19.7681 7.76562 24.5201 12.2129 25.157 17.9375H25.8712C26.4027 17.9375 26.8337 18.3782 26.8337 18.9219C26.8337 19.4655 26.4027 19.9062 25.8712 19.9062H2.12949C1.59792 19.9062 1.16699 19.4655 1.16699 18.9219C1.16699 18.3782 1.59792 17.9375 2.12949 17.9375H2.84369ZM5.01699 23.5156C5.01699 24.0593 5.44792 24.5 5.97949 24.5H22.0212C22.5527 24.5 22.9837 24.0593 22.9837 23.5156C22.9837 22.972 22.5527 22.5312 22.0212 22.5312H5.97949C5.44792 22.5312 5.01699 22.972 5.01699 23.5156Z"
        fill="#262626"
      />
    </svg>
  );
};

export default IconDish;
