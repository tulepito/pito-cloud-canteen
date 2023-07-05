import React from 'react';
import classNames from 'classnames';

import type { TIconProps } from '@utils/types';

import css from './IconFood.module.scss';

const IconFood: React.FC<TIconProps> = (props) => {
  const { rootClassName, className } = props;
  const classes = classNames(rootClassName || css.root, className);

  return (
    <svg
      className={classes}
      width={25}
      height={24}
      viewBox="0 0 25 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12.5 5.25C13.1075 5.25 13.6 4.74632 13.6 4.125C13.6 3.50368 13.1075 3 12.5 3C11.8925 3 11.4 3.50368 11.4 4.125C11.4 4.74632 11.8925 5.25 12.5 5.25ZM4.60024 15.375C5.13608 11.4028 8.46874 8.34375 12.5 8.34375C16.5313 8.34375 19.8639 11.4028 20.3998 15.375H4.60024ZM2.93717 15.375C3.48301 10.4682 7.55623 6.65625 12.5 6.65625C17.4438 6.65625 21.517 10.4682 22.0628 15.375H22.675C23.1306 15.375 23.5 15.7528 23.5 16.2188C23.5 16.6847 23.1306 17.0625 22.675 17.0625H2.325C1.86937 17.0625 1.5 16.6847 1.5 16.2188C1.5 15.7528 1.86937 15.375 2.325 15.375H2.93717ZM4.8 20.1562C4.8 20.6222 5.16937 21 5.625 21H19.375C19.8306 21 20.2 20.6222 20.2 20.1562C20.2 19.6903 19.8306 19.3125 19.375 19.3125H5.625C5.16937 19.3125 4.8 19.6903 4.8 20.1562Z"
        fill="#8C8C8C"
      />
    </svg>
  );
};

export default IconFood;
