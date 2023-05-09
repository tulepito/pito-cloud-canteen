import React from 'react';
import classNames from 'classnames';

import type { TIconProps } from '@utils/types';

import css from './IconCloseSquare.module.scss';

const IconCloseSquare: React.FC<TIconProps> = (props) => {
  const { className } = props;
  const classes = classNames(css.root, className);

  return (
    <svg
      className={classes}
      width={16}
      height={16}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6.40169 10.0903C6.27369 10.0903 6.14569 10.0417 6.04836 9.94367C5.85302 9.74834 5.85302 9.43234 6.04836 9.237L9.24302 6.04234C9.43836 5.847 9.75436 5.847 9.94969 6.04234C10.145 6.23767 10.145 6.55367 9.94969 6.749L6.75502 9.94367C6.65769 10.0417 6.52969 10.0903 6.40169 10.0903Z"
        fill="#8C8C8C"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M9.59762 10.0937C9.46962 10.0937 9.34162 10.045 9.24429 9.947L6.04695 6.749C5.85162 6.55367 5.85162 6.23767 6.04695 6.04234C6.24295 5.847 6.55895 5.847 6.75362 6.04234L9.95095 9.24034C10.1463 9.43567 10.1463 9.75167 9.95095 9.947C9.85362 10.045 9.72495 10.0937 9.59762 10.0937Z"
        fill="#8C8C8C"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M5.10998 2.33334C3.42331 2.33334 2.33331 3.48867 2.33331 5.27734V10.7227C2.33331 12.5113 3.42331 13.6667 5.10998 13.6667H10.8886C12.576 13.6667 13.6666 12.5113 13.6666 10.7227V5.27734C13.6666 3.48867 12.576 2.33334 10.8893 2.33334H5.10998ZM10.8886 14.6667H5.10998C2.85065 14.6667 1.33331 13.0813 1.33331 10.7227V5.27734C1.33331 2.91867 2.85065 1.33334 5.10998 1.33334H10.8893C13.1486 1.33334 14.6666 2.91867 14.6666 5.27734V10.7227C14.6666 13.0813 13.1486 14.6667 10.8886 14.6667Z"
        fill="#8C8C8C"
      />
    </svg>
  );
};

export default IconCloseSquare;
