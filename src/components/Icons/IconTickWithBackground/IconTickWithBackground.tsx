import React from 'react';
import classNames from 'classnames';

import type { TIconProps } from '@utils/types';

import css from './IconTickWithBackground.module.scss';

const IconTickWithBackground: React.FC<TIconProps> = (props) => {
  const { className } = props;
  const classes = classNames(css.root, className);

  return (
    <svg
      width="29"
      height="28"
      viewBox="0 0 29 28"
      fill="none"
      className={classes}
      xmlns="http://www.w3.org/2000/svg">
      <rect x="0.5" width="28" height="28" rx="14" fill="#65DB63" />
      <path
        d="M22.1282 8.37166C21.6332 7.87596 20.8293 7.87627 20.3336 8.37166L12.2566 16.449L8.6667 12.8591C8.171 12.3634 7.36748 12.3634 6.87178 12.8591C6.37607 13.3548 6.37607 14.1584 6.87178 14.6541L11.3589 19.1412C11.6066 19.3889 11.9314 19.5131 12.2562 19.5131C12.5811 19.5131 12.9062 19.3892 13.1539 19.1412L22.1282 10.1666C22.6239 9.6712 22.6239 8.86733 22.1282 8.37166Z"
        fill="white"
      />
    </svg>
  );
};

export default IconTickWithBackground;
