import type { TIconProps } from '@utils/types';
import classNames from 'classnames';
import React from 'react';

import css from './IconFilter.module.scss';

const IconFilter: React.FC<TIconProps> = (props) => {
  const { rootClassName, className } = props;

  return (
    <svg
      preserveAspectRatio="none"
      className={classNames(rootClassName, css.root, className)}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24">
      <path d="M19.479 2l-7.479 12.543v5.924l-1-.6v-5.324l-7.479-12.543h15.958zm3.521-2h-23l9 15.094v5.906l5 3v-8.906l9-15.094z" />
    </svg>
  );
};

export default IconFilter;
