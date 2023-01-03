import classNames from 'classnames';
import React from 'react';

import css from './IconCheckmark.module.scss';

enum Size {
  SMALL = 'small',
  BIG = 'big',
}
type TIconCheckmark = {
  rootClassName?: string;
  className?: string;
  size?: Size;
  width?: number;
  height?: number;
};

const IconCheckmark = (props: TIconCheckmark) => {
  const { rootClassName, className, size = Size.BIG, height, width } = props;
  const classes = classNames(rootClassName || css.root, className);

  let content = null;
  switch (size) {
    case Size.SMALL:
      content = (
        <svg
          className={classes}
          width={width}
          height={height}
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
          className={classes}
          strokeWidth="2"
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

export default IconCheckmark;
