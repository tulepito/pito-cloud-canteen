import React from 'react';
import classNames from 'classnames';

import type { TIconProps } from '@utils/types';

import css from './IconEdit.module.scss';

const IconEdit: React.FC<TIconProps> = (props) => {
  const { rootClassName, className, onClick } = props;
  const classes = classNames(rootClassName || css.root, className);

  return (
    <svg
      preserveAspectRatio="none"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={classes}
      onClick={onClick}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M20.7508 21.9395H13.4978C13.0838 21.9395 12.7478 21.6035 12.7478 21.1895C12.7478 20.7755 13.0838 20.4395 13.4978 20.4395H20.7508C21.1648 20.4395 21.5008 20.7755 21.5008 21.1895C21.5008 21.6035 21.1648 21.9395 20.7508 21.9395Z"
        fill="#262626"
      />
      <mask
        id="mask0_13062_197155"
        style={{ maskType: 'alpha' }}
        maskUnits="userSpaceOnUse"
        x="2"
        y="3"
        width="18"
        height="19">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M2.00024 3H19.1808V21.9395H2.00024V3Z"
          fill="white"
        />
      </mask>
      <g mask="url(#mask0_13062_197155)">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M13.1105 5.01664L3.69552 16.7916C3.52452 17.0056 3.46152 17.2816 3.52452 17.5466L4.20552 20.4316L7.24452 20.3936C7.53352 20.3906 7.80052 20.2616 7.97752 20.0416C11.1945 16.0166 17.3275 8.34264 17.5015 8.11764C17.6655 7.85164 17.7295 7.47564 17.6435 7.11364C17.5555 6.74264 17.3245 6.42764 16.9915 6.22664C16.9205 6.17764 15.2355 4.86964 15.1835 4.82864C14.5495 4.32064 13.6245 4.40864 13.1105 5.01664ZM3.61352 21.9396C3.26652 21.9396 2.96452 21.7016 2.88352 21.3626L2.06452 17.8916C1.89552 17.1726 2.06352 16.4306 2.52452 15.8546L11.9445 4.07264C11.9485 4.06864 11.9515 4.06364 11.9555 4.05964C12.9885 2.82464 14.8565 2.64264 16.1165 3.65364C16.1665 3.69264 17.8395 4.99264 17.8395 4.99264C18.4475 5.35464 18.9225 6.00164 19.1025 6.76764C19.2815 7.52564 19.1515 8.30764 18.7345 8.96864C18.7035 9.01764 18.6765 9.05964 9.14852 20.9796C8.68952 21.5516 8.00152 21.8846 7.26252 21.8936L3.62352 21.9396H3.61352Z"
          fill="#262626"
        />
      </g>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M16.2234 11.6854C16.0634 11.6854 15.9034 11.6344 15.7664 11.5304L10.3144 7.34236C9.98642 7.09036 9.92442 6.62036 10.1764 6.29036C10.4294 5.96236 10.8994 5.90136 11.2284 6.15336L16.6814 10.3404C17.0094 10.5924 17.0714 11.0634 16.8184 11.3924C16.6714 11.5844 16.4484 11.6854 16.2234 11.6854Z"
        fill="#262626"
      />
    </svg>
  );
};

export default IconEdit;
