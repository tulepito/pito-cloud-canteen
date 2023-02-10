import type { TIconProps } from '@utils/types';
import classNames from 'classnames';
import React from 'react';

import css from './IconWallet.module.scss';

const IconWallet: React.FC<TIconProps> = (props) => {
  const { rootClassName, className } = props;
  const classes = classNames(rootClassName, css.root, className);

  return (
    <svg
      preserveAspectRatio="none"
      viewBox="0 0 20 20"
      fill="none"
      className={classes}
      xmlns="http://www.w3.org/2000/svg">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M18.2406 13.2462H14.8672C13.2864 13.2462 11.9997 11.9604 11.9989 10.3804C11.9989 8.79873 13.2856 7.51206 14.8672 7.51123H18.2406C18.5856 7.51123 18.8656 7.79123 18.8656 8.13623C18.8656 8.48123 18.5856 8.76123 18.2406 8.76123H14.8672C13.9747 8.76206 13.2489 9.4879 13.2489 10.3796C13.2489 11.2704 13.9756 11.9962 14.8672 11.9962H18.2406C18.5856 11.9962 18.8656 12.2762 18.8656 12.6212C18.8656 12.9662 18.5856 13.2462 18.2406 13.2462Z"
        fill="#8C8C8C"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M15.2485 10.9531H14.9885C14.6435 10.9531 14.3635 10.6731 14.3635 10.3281C14.3635 9.98313 14.6435 9.70312 14.9885 9.70312H15.2485C15.5935 9.70312 15.8735 9.98313 15.8735 10.3281C15.8735 10.6731 15.5935 10.9531 15.2485 10.9531Z"
        fill="#8C8C8C"
      />
      <mask
        id="mask0_3330_4611"
        maskUnits="userSpaceOnUse"
        x="1"
        y="2"
        width="18"
        height="17">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M1.66663 2.5H18.8655V18.4774H1.66663V2.5Z"
          fill="white"
        />
      </mask>
      <g mask="url(#mask0_3330_4611)">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M6.66459 3.75C4.59793 3.75 2.91626 5.43167 2.91626 7.49833V13.4792C2.91626 15.5458 4.59793 17.2275 6.66459 17.2275H13.8679C15.9346 17.2275 17.6154 15.5458 17.6154 13.4792V7.49833C17.6154 5.43167 15.9346 3.75 13.8679 3.75H6.66459ZM13.8679 18.4775H6.66459C3.90876 18.4775 1.66626 16.235 1.66626 13.4792V7.49833C1.66626 4.74167 3.90876 2.5 6.66459 2.5H13.8679C16.6238 2.5 18.8654 4.74167 18.8654 7.49833V13.4792C18.8654 16.235 16.6238 18.4775 13.8679 18.4775Z"
          fill="#8C8C8C"
        />
      </g>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10.5705 7.53174H6.07129C5.72629 7.53174 5.44629 7.25174 5.44629 6.90674C5.44629 6.56174 5.72629 6.28174 6.07129 6.28174H10.5705C10.9155 6.28174 11.1955 6.56174 11.1955 6.90674C11.1955 7.25174 10.9155 7.53174 10.5705 7.53174Z"
        fill="#8C8C8C"
      />
    </svg>
  );
};

export default IconWallet;
