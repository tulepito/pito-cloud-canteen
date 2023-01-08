import type { TIconProps } from '@utils/types';
import classNames from 'classnames';
import React from 'react';

import css from './IconClose.module.scss';

const IconClose: React.FC<TIconProps> = (props) => {
  const { className, rootClassName, ...rest } = props;
  const classes = classNames(rootClassName || css.root, className);

  return (
    <svg
      preserveAspectRatio="none"
      width={12}
      height={12}
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={classes}
      {...rest}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7.4263 5.9877L11.7193 10.2807C12.0983 10.6731 12.0928 11.2968 11.7071 11.6825C11.3214 12.0682 10.6977 12.0737 10.3053 11.6947L6.0123 7.4017L1.71931 11.6947C1.46824 11.9546 1.09643 12.0589 0.746804 11.9674C0.397175 11.8759 0.124131 11.6028 0.0326158 11.2532C-0.0588995 10.9036 0.0453563 10.5318 0.305312 10.2807L4.5983 5.9877L0.305312 1.69471C-0.0736591 1.30233 -0.0682392 0.678626 0.317494 0.292893C0.703227 -0.0928402 1.32693 -0.09826 1.71931 0.280711L6.0123 4.5737L10.3053 0.280711C10.6977 -0.09826 11.3214 -0.0928402 11.7071 0.292893C12.0928 0.678626 12.0983 1.30233 11.7193 1.69471L7.4263 5.9877Z"
        fill="black"
      />
    </svg>
  );
};

export default IconClose;
