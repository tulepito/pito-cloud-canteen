import IconSpinner from '@components/IconSpinner/IconSpinner';
import React from 'react';

import css from './LoadingContainer.module.scss';

const LoadingContainer = () => {
  return (
    <div className={css.root}>
      <IconSpinner className={css.loadingIcon} />
    </div>
  );
};

export default LoadingContainer;
