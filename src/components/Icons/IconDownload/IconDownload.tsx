import React from 'react';
import classNames from 'classnames';

import type { TIconProps } from '@utils/types';

import css from './IconDownload.module.scss';

const IconDownload: React.FC<TIconProps> = (props) => {
  const { className } = props;
  const classes = classNames(className, css.root);

  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="none"
      className={classes}>
      <mask
        id="mask0_13664_4618"
        style={{ maskType: 'luminance' }}
        maskUnits="userSpaceOnUse"
        x="2"
        y="1"
        width="15"
        height="18">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M2.50021 1.67627H16.7104V18.2209H2.50021V1.67627Z"
          fill="white"
        />
      </mask>
      <g mask="url(#mask0_13664_4618)">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M6.3111 2.92627C4.93027 2.92627 3.7836 4.0446 3.7511 5.42377V14.3563C3.7211 15.7738 4.83777 16.9404 6.24194 16.9713H12.9778C14.3686 16.9213 15.4694 15.7738 15.4603 14.3604V6.9496L11.5986 2.92627H6.3211H6.3111ZM6.3211 18.2213H6.2161C4.12277 18.1763 2.4561 16.4363 2.5011 14.3429V5.40877C2.55027 3.34127 4.25694 1.67627 6.3086 1.67627H6.3236H11.8644C12.0344 1.67627 12.1969 1.74544 12.3153 1.86794L16.5369 6.26544C16.6478 6.38127 16.7103 6.5371 16.7103 6.69794V14.3563C16.7236 16.4471 15.0936 18.1463 12.9994 18.2213H6.3211Z"
          fill="#262626"
        />
      </g>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M16.0816 7.4865H13.7866C12.2608 7.48234 11.0216 6.239 11.0216 4.71567V2.2915C11.0216 1.9465 11.3016 1.6665 11.6466 1.6665C11.9916 1.6665 12.2716 1.9465 12.2716 2.2915V4.71567C12.2716 5.55234 12.9516 6.234 13.7883 6.2365H16.0816C16.4266 6.2365 16.7066 6.5165 16.7066 6.8615C16.7066 7.2065 16.4266 7.4865 16.0816 7.4865Z"
        fill="#262626"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M9.28558 13.9175C8.94058 13.9175 8.66058 13.6375 8.66058 13.2925V8.2583C8.66058 7.9133 8.94058 7.6333 9.28558 7.6333C9.63058 7.6333 9.91058 7.9133 9.91058 8.2583V13.2925C9.91058 13.6375 9.63058 13.9175 9.28558 13.9175Z"
        fill="#262626"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M9.28479 13.9154C9.11896 13.9154 8.95896 13.8496 8.84229 13.7313L6.88813 11.7696C6.64479 11.5246 6.64563 11.1288 6.88979 10.8854C7.13479 10.6421 7.53063 10.6421 7.77396 10.8871L9.28479 12.4054L10.7956 10.8871C11.039 10.6421 11.4348 10.6421 11.6798 10.8854C11.924 11.1288 11.9248 11.5246 11.6815 11.7696L9.72729 13.7313C9.61063 13.8496 9.45063 13.9154 9.28479 13.9154Z"
        fill="#262626"
      />
    </svg>
  );
};

export default IconDownload;
