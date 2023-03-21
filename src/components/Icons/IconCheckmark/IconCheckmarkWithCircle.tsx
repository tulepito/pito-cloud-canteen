import React from 'react';

import type { TIconProps } from '@utils/types';

const IconCheckmarkWithCircle: React.FC<TIconProps> = (props) => {
  const { className, onClick } = props;

  return (
    <svg
      className={className}
      onClick={onClick}
      width={28}
      height={28}
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg">
      <path
        d="M20.3569 9.51284C19.9443 9.09976 19.2744 9.10002 18.8613 9.51284L12.1305 16.2439L9.13893 13.2524C8.72585 12.8393 8.05624 12.8393 7.64316 13.2524C7.23007 13.6655 7.23007 14.3351 7.64316 14.7482L11.3825 18.4875C11.5889 18.6939 11.8595 18.7974 12.1302 18.7974C12.4009 18.7974 12.6718 18.6942 12.8782 18.4875L20.3569 11.0086C20.7699 10.5958 20.7699 9.9259 20.3569 9.51284Z"
        fill="#65DB63"
      />
      <rect
        x="2.75"
        y="2.75"
        width="22.5"
        height="22.5"
        rx="11.25"
        stroke="#65DB63"
        strokeWidth={2}
      />
    </svg>
  );
};

export default IconCheckmarkWithCircle;
