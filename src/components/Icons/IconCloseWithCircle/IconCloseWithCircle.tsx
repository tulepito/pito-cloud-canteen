import React from 'react';
import classNames from 'classnames';

import type { TIconProps } from '@utils/types';

import css from './IconCloseWithCircle.module.scss';

const IconCloseWithCircle: React.FC<TIconProps> = (props) => {
  const { className } = props;
  const classes = classNames(css.root, className);

  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      preserveAspectRatio="none"
      className={classes}
      xmlns="http://www.w3.org/2000/svg">
      <g clipPath="url(#clip0_1202_131926)">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M9.9987 17.9163C5.62644 17.9163 2.08203 14.3719 2.08203 9.99967C2.08203 5.62742 5.62644 2.08301 9.9987 2.08301C14.371 2.08301 17.9154 5.62742 17.9154 9.99967C17.9154 14.3719 14.371 17.9163 9.9987 17.9163ZM9.9987 19.1663C4.93609 19.1663 0.832031 15.0623 0.832031 9.99967C0.832031 4.93706 4.93609 0.833008 9.9987 0.833008C15.0613 0.833008 19.1654 4.93706 19.1654 9.99967C19.1654 15.0623 15.0613 19.1663 9.9987 19.1663ZM11.9094 6.91042L9.9987 8.82116L8.08795 6.91042C7.76252 6.58498 7.23488 6.58498 6.90944 6.91042C6.584 7.23586 6.584 7.76349 6.90944 8.08893L8.82019 9.99967L6.90944 11.9104C6.584 12.2359 6.584 12.7635 6.90944 13.0889C7.23488 13.4144 7.76252 13.4144 8.08795 13.0889L9.9987 11.1782L11.9094 13.0889C12.2349 13.4144 12.7625 13.4144 13.088 13.0889C13.4134 12.7635 13.4134 12.2359 13.088 11.9104L11.1772 9.99967L13.088 8.08893C13.4134 7.76349 13.4134 7.23586 13.088 6.91042C12.7625 6.58498 12.2349 6.58498 11.9094 6.91042Z"
          fill="#262626"
        />
      </g>
      <defs>
        <clipPath id="clip0_1202_131926">
          <rect width="20" height="20" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};

export default IconCloseWithCircle;
