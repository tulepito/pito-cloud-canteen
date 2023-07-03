/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/no-shadow */
import type { ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';

import css from './IntegrationFilterModal.module.scss';

type TIntegrationFilterModal = {
  onClear: () => void;
  className?: string;
  title?: string | ReactNode;
  leftFilters?: ReactNode;
  rightFilters?: ReactNode;
};

const IntegrationFilterModal: React.FC<TIntegrationFilterModal> = (props) => {
  const { className, leftFilters, rightFilters } = props;

  return (
    <div className={classNames(css.root, className)}>
      {leftFilters}
      <div className={css.rightButtons}>{rightFilters}</div>
    </div>
  );
};

export default IntegrationFilterModal;
