import type { TIconProps } from '@utils/types';
import React from 'react';

const IconCheckmarkWithCircle: React.FC<TIconProps> = (props) => {
  const { className, width, height } = props;
  return (
    <svg
      preserveAspectRatio="none"
      className={className}
      width={width}
      height={height}
      viewBox="0 0 26 26"
      fill="none"
      xmlns="http://www.w3.org/2000/svg">
      <path
        d="M19.3575 8.51284C18.945 8.09976 18.2751 8.10002 17.862 8.51284L11.1311 15.2439L8.13957 12.2524C7.72649 11.8393 7.05688 11.8393 6.6438 12.2524C6.23071 12.6655 6.23071 13.3351 6.6438 13.7482L10.3831 17.4875C10.5895 17.6939 10.8602 17.7974 11.1309 17.7974C11.4015 17.7974 11.6725 17.6942 11.8789 17.4875L19.3575 10.0086C19.7706 9.59579 19.7706 8.9259 19.3575 8.51284Z"
        fill="#027A48"
      />
      <rect
        x="1.75"
        y="1.75"
        width="22.5"
        height="22.5"
        rx="11.25"
        stroke="#027A48"
        strokeWidth={2}
      />
    </svg>
  );
};

export default IconCheckmarkWithCircle;
