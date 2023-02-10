import IconSpinner from '@components/Icons/IconSpinner/IconSpinner';
import classNames from 'classnames';
import React from 'react';

import css from './LoadingContainer.module.scss';

type TLoadingContainerProps = {
  loadingText?: string;
  loadingTextClassName?: string;
  className?: string;
  iconClassName?: string;
};

const LoadingContainer: React.FC<TLoadingContainerProps> = (props) => {
  const { loadingText, loadingTextClassName, className, iconClassName } = props;

  const loadingTextClasses = classNames(css.loadingText, loadingTextClassName);

  return (
    <div className={classNames(css.root, className)}>
      <IconSpinner className={classNames(css.loadingIcon, iconClassName)} />
      <div className={loadingTextClasses}>{loadingText}</div>
    </div>
  );
};

export default LoadingContainer;
