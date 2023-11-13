import React from 'react';
import classNames from 'classnames';

import type { TIconProps } from '@utils/types';

type TIconLightBulbProps = TIconProps & { variant?: 'on' | 'off' };

const IconLightBulb: React.FC<TIconLightBulbProps> = (props) => {
  const { rootClassName, className, variant = 'on', onClick } = props;
  const classes = classNames(rootClassName, className);

  return variant === 'on' ? (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={classes}
      preserveAspectRatio="none"
      onClick={onClick}>
      <path
        d="M21 2L20 3M3 2L4 3M21 16L20 15M3 16L4 15M9 18H15M10 21H14M12 3C8 3 5.952 4.95 6 8C6.023 9.487 6.5 10.5 7.5 11.5C8.5 12.5 9 13 9 15H15C15 13 15.5 12.5 16.5 11.5C17.5 10.5 17.977 9.487 18 8C18.048 4.95 16 3 12 3Z"
        stroke="#262626"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ) : null;
};

export default IconLightBulb;
