import IconSpinner from '@components/Icons/IconSpinner/IconSpinner';
import classNames from 'classnames';
import React from 'react';

import css from './LoadingContainer.module.scss';

type TLoadingContainerProps = {
  className?: string;
  iconClassName?: string;
};

const LoadingContainer: React.FC<TLoadingContainerProps> = (props) => {
  const { className, iconClassName } = props;
  const classes = classNames(css.root, className);
  const iconClasses = classNames(css.loadingIcon, iconClassName);
  return (
    <div className={classes}>
      <IconSpinner className={iconClasses} />
    </div>
  );
};

export default LoadingContainer;
