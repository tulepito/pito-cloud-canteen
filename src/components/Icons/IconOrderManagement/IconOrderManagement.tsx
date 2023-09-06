import React from 'react';
import classNames from 'classnames';

import type { TIconProps } from '@utils/types';

import css from './IconOrderManagement.module.scss';

const IconOrderManagement: React.FC<TIconProps> = (props) => {
  const { rootClassName, className } = props;
  const classes = classNames(rootClassName, className, css.root);

  return (
    <svg
      width="25"
      height="24"
      viewBox="0 0 25 24"
      fill="none"
      className={classes}
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M16.3411 16.9729H9.12109C8.70709 16.9729 8.37109 16.6369 8.37109 16.2229C8.37109 15.8089 8.70709 15.4729 9.12109 15.4729H16.3411C16.7551 15.4729 17.0911 15.8089 17.0911 16.2229C17.0911 16.6369 16.7551 16.9729 16.3411 16.9729Z"
        fill="#8C8C8C"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M16.3411 12.7854H9.12109C8.70709 12.7854 8.37109 12.4494 8.37109 12.0354C8.37109 11.6214 8.70709 11.2854 9.12109 11.2854H16.3411C16.7551 11.2854 17.0911 11.6214 17.0911 12.0354C17.0911 12.4494 16.7551 12.7854 16.3411 12.7854Z"
        fill="#8C8C8C"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11.8761 8.60962H9.12109C8.70709 8.60962 8.37109 8.27362 8.37109 7.85962C8.37109 7.44562 8.70709 7.10962 9.12109 7.10962H11.8761C12.2901 7.10962 12.6261 7.44562 12.6261 7.85962C12.6261 8.27362 12.2901 8.60962 11.8761 8.60962Z"
        fill="#8C8C8C"
      />

      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M16.534 3.5L8.845 3.504C6.517 3.518 5.125 4.958 5.125 7.357V16.553C5.125 18.968 6.53 20.41 8.881 20.41L16.57 20.407C18.898 20.393 20.29 18.951 20.29 16.553V7.357C20.29 4.942 18.886 3.5 16.534 3.5ZM8.882 21.91C5.738 21.91 3.625 19.757 3.625 16.553V7.357C3.625 4.124 5.672 2.023 8.84 2.004L16.533 2H16.534C19.678 2 21.79 4.153 21.79 7.357V16.553C21.79 19.785 19.743 21.887 16.575 21.907L8.882 21.91Z"
        fill="#8C8C8C"
      />
    </svg>
  );
};

export default IconOrderManagement;
