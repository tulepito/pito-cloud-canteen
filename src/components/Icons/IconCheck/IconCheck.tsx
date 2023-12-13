import React from 'react';
import classNames from 'classnames';

import type { TIconProps } from '@utils/types';

type TIconCheckProps = TIconProps;

const IconCheck: React.FC<TIconCheckProps> = (props) => {
  const { rootClassName, className, onClick } = props;
  const classes = classNames(rootClassName, className);

  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      className={classes}
      onClick={onClick}
      xmlns="http://www.w3.org/2000/svg">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M20.5738 5.65617C20.9643 6.0467 20.9643 6.67986 20.5738 7.07039L9.57381 18.0704C9.18328 18.4609 8.55012 18.4609 8.15959 18.0704L3.15959 13.0704C2.76907 12.6799 2.76907 12.0467 3.15959 11.6562C3.55012 11.2657 4.18328 11.2657 4.57381 11.6562L8.8667 15.9491L19.1596 5.65617C19.5501 5.26565 20.1833 5.26565 20.5738 5.65617Z"
        fill="#65DB63"
      />
    </svg>
  );
};

export default IconCheck;
