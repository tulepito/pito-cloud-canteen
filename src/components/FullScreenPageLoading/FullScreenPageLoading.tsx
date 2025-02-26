import React from 'react';
import classNames from 'classnames';

import LoadingContainer from '@components/LoadingContainer/LoadingContainer';

import css from './FullScreenPageLoading.module.scss';

const FullScreenPageLoading = ({ fullScreen }: { fullScreen?: boolean }) => {
  return (
    <div className={classNames({ [css.spinnerWrapper]: fullScreen })}>
      <LoadingContainer />
    </div>
  );
};

export default FullScreenPageLoading;
