import type { TIconProps } from '@utils/types';
import classNames from 'classnames';
import React from 'react';

import css from './IconOrderManagement.module.scss';

const IconOrderManagement: React.FC<TIconProps> = (props) => {
  const { rootClassName, className } = props;
  const classes = classNames(rootClassName, className, css.root);

  return (
    <svg
      preserveAspectRatio="none"
      className={classes}
      viewBox="0 0 16 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11.0963 13.1448H5.07959C4.73459 13.1448 4.45459 12.8648 4.45459 12.5198C4.45459 12.1748 4.73459 11.8948 5.07959 11.8948H11.0963C11.4413 11.8948 11.7213 12.1748 11.7213 12.5198C11.7213 12.8648 11.4413 13.1448 11.0963 13.1448Z"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11.0963 9.65601H5.07959C4.73459 9.65601 4.45459 9.37601 4.45459 9.03101C4.45459 8.68601 4.73459 8.40601 5.07959 8.40601H11.0963C11.4413 8.40601 11.7213 8.68601 11.7213 9.03101C11.7213 9.37601 11.4413 9.65601 11.0963 9.65601Z"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7.37542 6.17542H5.07959C4.73459 6.17542 4.45459 5.89542 4.45459 5.55042C4.45459 5.20542 4.73459 4.92542 5.07959 4.92542H7.37542C7.72042 4.92542 8.00042 5.20542 8.00042 5.55042C8.00042 5.89542 7.72042 6.17542 7.37542 6.17542Z"
      />
      <mask
        id="mask0_3643_22274"
        maskUnits="userSpaceOnUse"
        x="0"
        y="0"
        width="16"
        height="18">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M0.5 0.66687H15.6372V17.2584H0.5V0.66687Z"
          fill="white"
        />
      </mask>
      <g mask="url(#mask0_3643_22274)">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M11.257 1.91675L4.84951 1.92008C2.90951 1.93175 1.74951 3.13175 1.74951 5.13091V12.7942C1.74951 14.8067 2.92035 16.0084 4.87951 16.0084L11.287 16.0059C13.227 15.9942 14.387 14.7926 14.387 12.7942V5.13091C14.387 3.11841 13.217 1.91675 11.257 1.91675ZM4.88034 17.2584C2.26034 17.2584 0.499512 15.4642 0.499512 12.7942V5.13091C0.499512 2.43675 2.20535 0.685915 4.84535 0.670081L11.2562 0.666748H11.257C13.877 0.666748 15.637 2.46091 15.637 5.13091V12.7942C15.637 15.4876 13.9312 17.2392 11.2912 17.2559L4.88034 17.2584Z"
        />
      </g>
    </svg>
  );
};

export default IconOrderManagement;
