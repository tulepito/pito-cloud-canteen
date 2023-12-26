import React from 'react';
import classNames from 'classnames';

import type { TIconProps } from '@utils/types';

import css from './IconBorderStar.module.scss';

type TIconBorderStar = TIconProps & { strokeColor?: string };

const IconBorderStar: React.FC<TIconBorderStar> = ({
  rootClassName,
  className,
  strokeColor = '#FADB14',
}) => {
  const classes = classNames(rootClassName || css.root, className);

  return (
    <svg
      className={classes}
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg">
      <g id="Icon / Star Gray">
        <path
          id="Star"
          fillRule="evenodd"
          clipRule="evenodd"
          d="M11.9999 19.0672L7.0997 21.0528C6.44026 21.32 5.68905 21.002 5.42183 20.3426C5.348 20.1604 5.31684 19.9637 5.33076 19.7676L5.70497 14.4937L2.30229 10.4469C1.84437 9.90232 1.91464 9.08963 2.45923 8.63171C2.60971 8.50518 2.78715 8.41477 2.97796 8.3674L8.1094 7.09356L10.9066 2.60691C11.283 2.00312 12.0777 1.81881 12.6815 2.19524C12.8483 2.29926 12.9891 2.44007 13.0931 2.60691L15.8903 7.09356L21.0218 8.3674C21.7123 8.53883 22.1332 9.23761 21.9617 9.92818C21.9144 10.119 21.824 10.2964 21.6974 10.4469L18.2948 14.4937L18.669 19.7676C18.7193 20.4773 18.1848 21.0935 17.4751 21.1439C17.2789 21.1578 17.0822 21.1266 16.9 21.0528L11.9999 19.0672Z"
          stroke={strokeColor}
          strokeWidth="1.5"
        />
      </g>
    </svg>
  );
};

export default IconBorderStar;
