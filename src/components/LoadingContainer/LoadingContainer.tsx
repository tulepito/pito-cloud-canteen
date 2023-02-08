import IconSpinner from '@components/Icons/IconSpinner/IconSpinner';
import classNames from 'classnames';
import React from 'react';

import css from './LoadingContainer.module.scss';

type TLoadingContainerProps = {
  loadingText?: string;
  loadingTextClassName?: string;
};

const LoadingContainer: React.FC<TLoadingContainerProps> = (props) => {
  const { loadingText, loadingTextClassName } = props;

  const loadingTextClasses = classNames(css.loadingText, loadingTextClassName);

  return (
    <div className={css.root}>
      <IconSpinner className={css.loadingIcon} />
      <div className={loadingTextClasses}>{loadingText}</div>
    </div>
  );
};

export default LoadingContainer;
