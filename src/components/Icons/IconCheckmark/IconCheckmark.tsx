import type { TIconProps } from '@utils/types';
import classNames from 'classnames';
import React from 'react';

import css from './IconCheckmark.module.scss';

enum Size {
  SMALL = 'small',
  BIG = 'big',
}

type TIconCheckmarkProps = TIconProps & {
  size?: Size;
  width?: number;
  height?: number;
};

const IconCheckmark: React.FC<TIconCheckmarkProps> = (props) => {
  const { rootClassName, className, size = Size.BIG, height, width } = props;
  const classes = classNames(rootClassName || css.root, className);

  let content = null;
  switch (size) {
    case Size.SMALL:
      content = (
        <svg
          preserveAspectRatio="none"
          width={width}
          height={height}
          className={classes}
          xmlns="http://www.w3.org/2000/svg">
          <path
            d="M14 2l-8 8-4-4"
            strokeWidth="2.5"
            fill="none"
            fillRule="evenodd"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
      break;
    case Size.BIG:
      content = (
        <svg
          preserveAspectRatio="none"
          strokeWidth="2"
          className={classes}
          xmlns="http://www.w3.org/2000/svg">
          <path d="M22.6 1.2c-.4-.3-1-.2-1.3.2L7.8 19l-5.2-5c-.4-.4-1-.4-1.3 0-.4.3-.4.8 0 1l6 5.6.6.2s.2 0 .4-.4l14.3-18c.3-.5.2-1-.2-1" />
        </svg>
      );
      break;
    default:
      content = null;
  }

  return content;
};

const IconCheckmarkTabTitle: React.FC<TIconProps> = (props) => {
  const { className, width = 14, height = 10 } = props;
  return (
    <svg
      className={className}
      width={width}
      height={height}
      viewBox="0 0 14 10"
      fill="none"
      xmlns="http://www.w3.org/2000/svg">
      <path
        d="M13.3575 0.309716C12.945 -0.103369 12.2751 -0.103108 11.862 0.309716L5.13114 7.04082L2.13957 4.04928C1.72649 3.63619 1.05688 3.63619 0.643798 4.04928C0.230713 4.46236 0.230713 5.13197 0.643798 5.54505L4.3831 9.28435C4.58951 9.49077 4.86017 9.59423 5.13086 9.59423C5.40154 9.59423 5.67246 9.49103 5.87887 9.28435L13.3575 1.80546C13.7706 1.39266 13.7706 0.722775 13.3575 0.309716Z"
        fill="#027A48"
      />
    </svg>
  );
};

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

// eslint-disable-next-line import/no-anonymous-default-export
export default {
  IconCheckmark,
  IconCheckmarkTabTitle,
  IconCheckmarkWithCircle,
};
