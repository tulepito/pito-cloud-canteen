import type { TIconProps } from '@utils/types';
import classNames from 'classnames';
import React from 'react';

import css from './IconHeart.module.scss';

const IconHeart: React.FC<TIconProps> = (props) => {
  const { rootClassName, className } = props;
  const classes = classNames(rootClassName || css.root, className);

  return (
    <svg
      className={classes}
      viewBox="0 0 25 24"
      fill="none"
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg">
      <mask
        id="mask0_6095_3447"
        style={{ maskType: 'luminance' }}
        maskUnits="userSpaceOnUse"
        x={2}
        y={3}
        width={21}
        height={20}>
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M2.46484 3H22.9374V22.501H2.46484V3Z"
          fill="white"
        />
      </mask>
      <g mask="url(#mask0_6095_3447)">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M4.28853 12.1222C5.69053 16.4842 11.2295 20.0112 12.7015 20.8842C14.1785 20.0022 19.7575 16.4362 21.1145 12.1262C22.0055 9.3402 21.1785 5.8112 17.8925 4.7522C16.3005 4.2412 14.4435 4.5522 13.1615 5.5442C12.8935 5.7502 12.5215 5.7542 12.2515 5.5502C10.8935 4.5292 9.11953 4.2302 7.50253 4.7522C4.22153 5.8102 3.39753 9.3392 4.28853 12.1222ZM12.7026 22.5011C12.5786 22.5011 12.4556 22.4711 12.3436 22.4101C12.0306 22.2391 4.65756 18.1751 2.86056 12.5811C2.85956 12.5811 2.85956 12.5801 2.85956 12.5801C1.73156 9.05812 2.98756 4.63212 7.04256 3.32512C8.94656 2.70912 11.0216 2.98012 12.6996 4.03912C14.3256 3.01112 16.4856 2.72712 18.3516 3.32512C22.4106 4.63412 23.6706 9.05912 22.5436 12.5801C20.8046 18.1101 13.3776 22.2351 13.0626 22.4081C12.9506 22.4701 12.8266 22.5011 12.7026 22.5011Z"
          fill="#595959"
        />
      </g>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M18.6185 10.6243C18.2315 10.6243 17.9035 10.3273 17.8715 9.93529C17.8055 9.11329 17.2555 8.41929 16.4725 8.16629C16.0775 8.03829 15.8615 7.61529 15.9885 7.22229C16.1175 6.82829 16.5365 6.61429 16.9325 6.73829C18.2955 7.17929 19.2505 8.38629 19.3675 9.81329C19.4005 10.2263 19.0935 10.5883 18.6805 10.6213C18.6595 10.6233 18.6395 10.6243 18.6185 10.6243Z"
        fill="#595959"
      />
    </svg>
  );
};

export default IconHeart;
