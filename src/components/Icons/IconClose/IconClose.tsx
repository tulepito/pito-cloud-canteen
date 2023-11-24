import React from 'react';
import classNames from 'classnames';

import type { TIconProps } from '@utils/types';

import css from './IconClose.module.scss';

const IconClose: React.FC<TIconProps> = (props) => {
  const { className, rootClassName, ...rest } = props;
  const classes = classNames(rootClassName || css.root, className);

  return (
    <svg
      width="25"
      height="24"
      viewBox="0 0 25 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="none"
      className={classes}
      {...rest}>
      <path
        d="M19.5772 18.2156C19.718 18.3578 19.797 18.5498 19.797 18.75C19.797 18.9501 19.718 19.1422 19.5772 19.2843C19.4338 19.423 19.2422 19.5004 19.0428 19.5004C18.8434 19.5004 18.6518 19.423 18.5084 19.2843L12.2928 13.0593L6.07717 19.2843C5.93381 19.423 5.7422 19.5004 5.54279 19.5004C5.34338 19.5004 5.15177 19.423 5.00842 19.2843C4.86758 19.1422 4.78857 18.9501 4.78857 18.75C4.78857 18.5498 4.86758 18.3578 5.00842 18.2156L11.2334 12L5.00842 5.78435C4.88882 5.63862 4.8277 5.45363 4.83695 5.26534C4.8462 5.07705 4.92515 4.89893 5.05845 4.76563C5.19175 4.63233 5.36987 4.55338 5.55816 4.54413C5.74645 4.53488 5.93145 4.596 6.07717 4.7156L12.2928 10.9406L18.5084 4.7156C18.6541 4.596 18.8391 4.53488 19.0274 4.54413C19.2157 4.55338 19.3938 4.63233 19.5271 4.76563C19.6604 4.89893 19.7394 5.07705 19.7486 5.26534C19.7579 5.45363 19.6968 5.63862 19.5772 5.78435L13.3522 12L19.5772 18.2156Z"
        fill="#262626"
      />
    </svg>
  );
};

export default IconClose;
