import type { TIconProps } from '@utils/types';
import classNames from 'classnames';
import React from 'react';

import css from './IconOrderManagement.module.scss';

const IconOrderManagement: React.FC<TIconProps> = (props) => {
  const { className } = props;
  const classes = classNames(className, css.root);
  return (
    <svg
      className={classes}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M13.0965 14.1448H7.07983C6.73483 14.1448 6.45483 13.8648 6.45483 13.5198C6.45483 13.1748 6.73483 12.8948 7.07983 12.8948H13.0965C13.4415 12.8948 13.7215 13.1748 13.7215 13.5198C13.7215 13.8648 13.4415 14.1448 13.0965 14.1448"
        fill="#8C8C8C"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M13.0965 10.656H7.07983C6.73483 10.656 6.45483 10.376 6.45483 10.031C6.45483 9.68601 6.73483 9.40601 7.07983 9.40601H13.0965C13.4415 9.40601 13.7215 9.68601 13.7215 10.031C13.7215 10.376 13.4415 10.656 13.0965 10.656"
        fill="#8C8C8C"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M9.37542 7.17542H7.07959C6.73459 7.17542 6.45459 6.89542 6.45459 6.55042C6.45459 6.20542 6.73459 5.92542 7.07959 5.92542H9.37542C9.72042 5.92542 10.0004 6.20542 10.0004 6.55042C10.0004 6.89542 9.72042 7.17542 9.37542 7.17542"
        fill="#8C8C8C"
      />
      <mask
        id="mask0_3328_2772"
        maskUnits="userSpaceOnUse"
        x="2"
        y="1"
        width="16"
        height="18">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M2.5 1.66687H17.6372V18.2584H2.5V1.66687Z"
          fill="white"
        />
      </mask>
      <g mask="url(#mask0_3328_2772)">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M13.2573 2.91675L6.84976 2.92008C4.90976 2.93175 3.74976 4.13175 3.74976 6.13091V13.7942C3.74976 15.8067 4.92059 17.0084 6.87976 17.0084L13.2873 17.0059C15.2273 16.9942 16.3873 15.7926 16.3873 13.7942V6.13091C16.3873 4.11841 15.2173 2.91675 13.2573 2.91675ZM6.88059 18.2584C4.26059 18.2584 2.49976 16.4642 2.49976 13.7942V6.13091C2.49976 3.43675 4.20559 1.68591 6.84559 1.67008L13.2564 1.66675H13.2573C15.8773 1.66675 17.6373 3.46091 17.6373 6.13091V13.7942C17.6373 16.4876 15.9314 18.2392 13.2914 18.2559L6.88059 18.2584Z"
          fill="#8C8C8C"
        />
      </g>
    </svg>
  );
};

export default IconOrderManagement;
