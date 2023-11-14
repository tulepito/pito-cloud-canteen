import React from 'react';

import type { TIconProps } from '@src/utils/types';

type TIconWarningProps = TIconProps & {};

const IconWarning: React.FC<TIconWarningProps> = ({ className }) => {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 28 28"
      fill="none"
      className={className}
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg">
      <g clipPath="url(#clip0_922_14326)">
        <path
          d="M23.8995 23.8995C29.3668 18.4322 29.3668 9.56785 23.8995 4.10051C18.4322 -1.36683 9.56784 -1.36684 4.1005 4.1005C-1.36684 9.56784 -1.36683 18.4322 4.10051 23.8995C9.56785 29.3668 18.4322 29.3668 23.8995 23.8995Z"
          fill="#FFA940"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M14.0042 18.2248C13.6935 18.2248 13.4276 17.9597 13.3737 17.5951L11.7845 6.87623C11.5847 5.52631 12.4568 4.28882 13.6077 4.28882H14.4C15.5509 4.28882 16.423 5.52631 16.2232 6.87623L14.634 17.5951C14.5808 17.9597 14.3149 18.2248 14.0042 18.2248Z"
          fill="white"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M15.4588 22.2572C15.4588 21.4565 14.8055 20.8032 14.0048 20.8032C13.2041 20.8032 12.5508 21.4565 12.5508 22.2572C12.5508 23.0579 13.2041 23.7112 14.0048 23.7112C14.8055 23.7112 15.4588 23.0587 15.4588 22.2572Z"
          fill="white"
        />
      </g>
      <defs>
        <clipPath id="clip0_922_14326">
          <rect width="28" height="28" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};

export default IconWarning;
