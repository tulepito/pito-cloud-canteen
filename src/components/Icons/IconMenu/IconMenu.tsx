import type { TIconProps } from '@utils/types';
import classNames from 'classnames';
import React from 'react';

import css from './IconMenu.module.scss';

const IconMenu: React.FC<TIconProps> = (props) => {
  const { rootClassName, className, onClick } = props;
  const classes = classNames(rootClassName || css.root, className);

  return (
    <svg
      preserveAspectRatio="none"
      viewBox="0 0 20 20"
      fill="none"
      className={classes}
      onClick={onClick}
      xmlns="http://www.w3.org/2000/svg">
      <mask
        id="mask0_3330_1008"
        maskUnits="userSpaceOnUse"
        x="1"
        y="0"
        width="18"
        height="19">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M1.66675 0.833496H18.7499V18.7543H1.66675V0.833496Z"
          fill="white"
        />
      </mask>
      <g mask="url(#mask0_3330_1008)">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M11.4307 12.7426C12.434 12.7426 13.2507 13.5535 13.2507 14.5501V17.1135C13.2507 17.3276 13.4223 17.4993 13.6423 17.5043H15.2307C16.4823 17.5043 17.4998 16.4993 17.4998 15.2643V7.99429C17.494 7.56929 17.2915 7.16929 16.944 6.90346L11.4498 2.52179C10.7123 1.93763 9.68067 1.93763 8.94067 2.52346L3.484 6.90179C3.12317 7.17596 2.92067 7.57596 2.9165 8.00846V15.2643C2.9165 16.4993 3.934 17.5043 5.18567 17.5043H6.789C7.01484 17.5043 7.19817 17.3251 7.19817 17.1051C7.19817 17.0568 7.204 17.0085 7.214 16.9626V14.5501C7.214 13.5593 8.02567 12.7493 9.0215 12.7426H11.4307ZM15.2307 18.7543H13.6273C12.709 18.7326 12.0007 18.0118 12.0007 17.1135V14.5501C12.0007 14.2426 11.7448 13.9926 11.4307 13.9926H9.02567C8.71817 13.9943 8.464 14.2451 8.464 14.5501V17.1051C8.464 17.1676 8.45567 17.2276 8.43817 17.2843C8.34817 18.1093 7.64317 18.7543 6.789 18.7543H5.18567C3.24484 18.7543 1.6665 17.1885 1.6665 15.2643V8.00263C1.67484 7.17429 2.0565 6.41596 2.71567 5.91679L8.1615 1.54596C9.36067 0.59596 11.0315 0.59596 12.2282 1.54429L17.7132 5.91929C18.3573 6.41013 18.739 7.16679 18.7498 7.98513V15.2643C18.7498 17.1885 17.1715 18.7543 15.2307 18.7543V18.7543Z"
          fill="#8C8C8C"
        />
      </g>
    </svg>
  );
};

export default IconMenu;
