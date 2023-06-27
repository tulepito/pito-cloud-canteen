import React from 'react';
import classNames from 'classnames';

import type { TIconProps } from '@src/utils/types';

const IconWarningWithTriangle: React.FC<TIconProps> = (props) => {
  const { rootClassName, className } = props;
  const classes = classNames(rootClassName, className);

  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      className={classes}
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg">
      <mask
        id="mask0_11654_272827"
        style={{ maskType: 'luminance' }}
        maskUnits="userSpaceOnUse"
        x="2"
        y="3"
        width="21"
        height="19">
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M2 3H22.0137V21.1855H2V3Z"
          fill="white"
        />
      </mask>
      <g mask="url(#mask0_11654_272827)">
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M12.013 4.5C11.537 4.5 11.113 4.746 10.875 5.159L3.67701 17.724C3.44301 18.134 3.44501 18.623 3.68201 19.032C3.91901 19.441 4.34301 19.686 4.81601 19.686H19.199C19.671 19.686 20.095 19.441 20.332 19.032C20.57 18.623 20.572 18.134 20.336 17.724L13.151 5.159C12.914 4.746 12.49 4.5 12.013 4.5ZM19.199 21.186H4.81601C3.80201 21.186 2.89301 20.662 2.38401 19.784C1.87501 18.907 1.87201 17.858 2.37501 16.979L9.57501 4.413C10.081 3.528 10.992 3 12.013 3H12.014C13.034 3 13.947 3.529 14.453 4.415L21.639 16.979C22.142 17.858 22.139 18.907 21.63 19.784C21.121 20.662 20.212 21.186 19.199 21.186Z"
          fill="#FFB13D"
        />
      </g>
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M12.0039 14.1625C11.5899 14.1625 11.2539 13.8265 11.2539 13.4125V10.3125C11.2539 9.8985 11.5899 9.5625 12.0039 9.5625C12.4179 9.5625 12.7539 9.8985 12.7539 10.3125V13.4125C12.7539 13.8265 12.4179 14.1625 12.0039 14.1625Z"
        fill="#FFB13D"
      />
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M12.005 17.5C11.452 17.5 11 17.053 11 16.5C11 15.947 11.443 15.5 11.995 15.5H12.005C12.558 15.5 13.005 15.947 13.005 16.5C13.005 17.053 12.558 17.5 12.005 17.5Z"
        fill="#FFB13D"
      />
    </svg>
  );
};

export default IconWarningWithTriangle;
